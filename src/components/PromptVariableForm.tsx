import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface PromptVariable {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'email' | 'url';
  label: string;
  defaultValue?: string;
  options?: string[]; // For select type
  required: boolean;
  rawMatch: string; // The full {{...}} pattern to replace
}

interface PromptVariableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptText: string;
  onSubmit: (completedPrompt: string) => void;
}

export function PromptVariableForm({ open, onOpenChange, promptText, onSubmit }: PromptVariableFormProps) {
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && promptText) {
      const parsed = parseVariables(promptText);
      setVariables(parsed);
      
      // Initialize form values with defaults
      const initialValues: Record<string, string> = {};
      parsed.forEach(v => {
        if (v.defaultValue) {
          initialValues[v.name] = v.defaultValue;
        }
      });
      setFormValues(initialValues);
      setErrors({});
    }
  }, [open, promptText]);

  const parseVariables = (text: string): PromptVariable[] => {
    const variableRegex = /\{\{(\??)([^:}]+):([^:}]+)(?::([^:}]+?))?(?::([^}]+?))?\}\}/g;
    const variables: PromptVariable[] = [];
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      const [fullMatch, optionalMarker, name, type, label, defaultOrOptions] = match;
      const isOptional = optionalMarker === '?';
      
      let options: string[] | undefined;
      let defaultValue: string | undefined;

      // For select type, parse options
      if (type === 'select' && defaultOrOptions) {
        const parts = defaultOrOptions.split('|');
        if (parts.length === 2) {
          defaultValue = parts[0];
          options = parts[1].split(',').map(o => o.trim());
        } else {
          options = defaultOrOptions.split(',').map(o => o.trim());
        }
      } else {
        defaultValue = defaultOrOptions;
      }

      variables.push({
        name: name.trim(),
        type: type.trim() as PromptVariable['type'],
        label: label?.trim() || name.trim().replace(/_/g, ' '),
        defaultValue,
        options,
        required: !isOptional,
        rawMatch: fullMatch,
      });
    }

    return variables;
  };

  const validateField = (variable: PromptVariable, value: string): string | null => {
    if (variable.required && !value?.trim()) {
      return 'This field is required';
    }

    if (!value) return null; // Optional empty field

    switch (variable.type) {
      case 'email':
        const emailSchema = z.string().email();
        try {
          emailSchema.parse(value);
          return null;
        } catch {
          return 'Please enter a valid email address';
        }

      case 'url':
        const urlSchema = z.string().url();
        try {
          urlSchema.parse(value);
          return null;
        } catch {
          return 'Please enter a valid URL (include http:// or https://)';
        }

      case 'number':
        if (isNaN(Number(value))) {
          return 'Please enter a valid number';
        }
        return null;

      case 'text':
        if (value.length > 500) {
          return 'Maximum 500 characters allowed';
        }
        return null;

      case 'textarea':
        if (value.length > 5000) {
          return 'Maximum 5000 characters allowed';
        }
        return null;

      case 'select':
        if (variable.options && !variable.options.includes(value)) {
          return 'Please select a valid option';
        }
        return null;

      default:
        return null;
    }
  };

  const sanitizeInput = (value: string): string => {
    // Strip HTML tags and encode special characters
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .trim();
  };

  const handleValueChange = (variableName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [variableName]: value }));
    
    // Clear error when user starts typing
    if (errors[variableName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[variableName];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    variables.forEach(variable => {
      const value = formValues[variable.name];
      const error = validateField(variable, value);
      if (error) {
        newErrors[variable.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize all inputs
      const sanitizedValues: Record<string, string> = {};
      Object.entries(formValues).forEach(([key, value]) => {
        sanitizedValues[key] = sanitizeInput(value || '');
      });

      // Replace variables in prompt text
      let completedPrompt = promptText;
      variables.forEach(variable => {
        const value = sanitizedValues[variable.name] || '';
        completedPrompt = completedPrompt.replace(variable.rawMatch, value);
      });

      onSubmit(completedPrompt);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (variable: PromptVariable) => {
    const value = formValues[variable.name] || '';
    const error = errors[variable.name];
    const fieldId = `field-${variable.name}`;

    return (
      <div key={variable.name} className="space-y-2">
        <Label htmlFor={fieldId} className={cn(error && "text-destructive")}>
          {variable.label}
          {!variable.required && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
        </Label>

        {variable.type === 'text' && (
          <Input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue}
            className={cn(error && "border-destructive")}
          />
        )}

        {variable.type === 'textarea' && (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue}
            rows={4}
            className={cn(error && "border-destructive")}
          />
        )}

        {variable.type === 'number' && (
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue}
            className={cn(error && "border-destructive")}
          />
        )}

        {variable.type === 'email' && (
          <Input
            id={fieldId}
            type="email"
            value={value}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue || "example@email.com"}
            className={cn(error && "border-destructive")}
          />
        )}

        {variable.type === 'url' && (
          <Input
            id={fieldId}
            type="url"
            value={value}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.defaultValue || "https://example.com"}
            className={cn(error && "border-destructive")}
          />
        )}

        {variable.type === 'select' && variable.options && (
          <Select value={value} onValueChange={(val) => handleValueChange(variable.name, val)}>
            <SelectTrigger id={fieldId} className={cn(error && "border-destructive")}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {variable.options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {variable.type === 'date' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={fieldId}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleValueChange(variable.name, date ? format(date, "yyyy-MM-dd") : '')}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}

        {error && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Complete Prompt Details</DialogTitle>
          <DialogDescription>
            Fill in the required information to customise this prompt
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 py-4">
            {variables.map(renderField)}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Use Prompt'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
