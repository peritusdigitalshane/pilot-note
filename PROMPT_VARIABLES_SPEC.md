# Prompt Variables Specification

## Overview
This specification defines how prompt authors can embed fillable variables into prompts, enabling dynamic form generation and user input collection before prompt execution.

## Variable Syntax

### Basic Syntax
Variables are declared using double curly braces with metadata separated by colons:

```
{{variable_name:type:label:default_value}}
```

### Components
1. **variable_name**: Unique identifier (snake_case, alphanumeric + underscores)
2. **type**: Field type (text, textarea, number, select, date, email, url)
3. **label**: Human-readable label for the form field (optional, defaults to variable_name)
4. **default_value**: Pre-filled value (optional)

### Examples

#### Text Input
```
{{company_name:text:Company Name:Acme Corp}}
```

#### Text Area
```
{{project_description:textarea:Describe Your Project}}
```

#### Number Input
```
{{budget:number:Budget Amount:50000}}
```

#### Select Dropdown
```
{{priority:select:Priority:medium|low,medium,high}}
```
Format: `{{name:select:label:default|option1,option2,option3}}`

#### Date Picker
```
{{deadline:date:Project Deadline}}
```

#### Email Input
```
{{contact_email:email:Contact Email}}
```

#### URL Input
```
{{website:url:Website URL}}
```

## Complete Example

```
Analyse this revenue recognition scenario for {{company_name:text:Company Name}}. 

Project Details:
- Industry: {{industry:select:Industry Sector:technology|technology,healthcare,finance,retail}}
- Transaction Amount: ${{amount:number:Transaction Amount}}
- Contract Date: {{contract_date:date:Contract Date}}

Description:
{{transaction_details:textarea:Transaction Description}}

Please provide:
1) Step-by-step application of the five-step model
2) Identification of performance obligations
3) Treatment of variable consideration
4) Appropriate journal entries and disclosure notes

Contact for follow-up: {{contact_email:email:Email Address:finance@example.com}}
```

## Form Generation Rules

### Required Fields
- All variables are required by default unless wrapped in optional syntax: `{{?variable_name:type:label}}`
- Optional fields show "(optional)" in the label

### Validation Rules
- **text**: Max 500 characters
- **textarea**: Max 5000 characters
- **number**: Must be numeric, can include decimals
- **email**: Must match email pattern
- **url**: Must match URL pattern with protocol
- **date**: Must be valid date, not in the past (configurable)
- **select**: Must be one of the defined options

### Field Order
Fields appear in the form in the order they appear in the prompt text.

## Security Considerations

### Input Sanitisation
- Strip HTML tags from all text inputs
- Encode special characters for display
- Validate against injection patterns
- Enforce maximum length limits

### Validation
- Client-side validation for UX
- Server-side validation before prompt execution
- Type checking for all inputs
- Range checking for numbers

## Localisation Support

### Label Translation
Variables support localisation keys:
```
{{amount:number:i18n.forms.amount}}
```

### Number Formatting
Numbers respect locale settings:
- Decimal separators (. vs ,)
- Thousand separators
- Currency formatting when preceded by $, £, €, etc.

### Date Formatting
Dates follow user's locale:
- DD/MM/YYYY (AU, UK)
- MM/DD/YYYY (US)
- YYYY-MM-DD (ISO)

## Implementation Flow

### 1. Prompt Detection
When user clicks a prompt:
```javascript
const hasVariables = /\{\{[^}]+\}\}/.test(promptText);
if (hasVariables) {
  showVariableForm(promptText);
} else {
  insertPrompt(promptText);
}
```

### 2. Variable Parsing
Extract and parse all variables:
```javascript
const variableRegex = /\{\{\??([^:}]+):([^:}]+)(?::([^:}]+)?)?(?::([^}]+))?\}\}/g;
```

### 3. Form Generation
Generate form fields based on variable metadata:
- Render appropriate input component for each type
- Apply validation rules
- Set default values
- Handle optional fields

### 4. Form Submission
On form submit:
- Validate all required fields
- Sanitise input values
- Replace variables with user input
- Send completed prompt to chat

### 5. Variable Replacement
Replace each variable with its value:
```javascript
let completedPrompt = promptText;
for (const [key, value] of Object.entries(formValues)) {
  const pattern = new RegExp(`\\{\\{\\??${key}:[^}]+\\}\\}`, 'g');
  completedPrompt = completedPrompt.replace(pattern, value);
}
```

## Error Handling

### Invalid Syntax
- Show warning to prompt author (in editor mode)
- Fall back to treating as plain text
- Log error for debugging

### Missing Required Fields
- Highlight missing fields in red
- Show error message below field
- Prevent form submission

### Validation Failures
- Show inline error messages
- Focus first invalid field
- Allow correction without losing other values

## Chrome Extension Considerations

### Popup Form
- Open modal dialog in extension popup
- Compact layout (max 400px width)
- Scroll for long forms
- Sticky submit button

### Cross-Tab Communication
- Store form state in chrome.storage.local
- Sync across extension instances
- Clear after successful submission

## Training Wheels Format Integration

Variables work seamlessly with Training Wheels:
```
Create a comprehensive 3-5 year strategic plan for {{org_name:text:Organisation Name}}.

<context>
Industry: {{industry:select:Industry:technology|technology,healthcare,finance}}
Current revenue: ${{revenue:number:Annual Revenue}}
Target market: {{market:textarea:Target Market Description}}
</context>

<requirements>
- Timeline: {{timeline:number:Planning Horizon (years):5}} years
- Budget: ${{budget:number:Available Budget}}
- Review date: {{review_date:date:First Review Date}}
</requirements>

Please provide...
```

## Best Practices for Prompt Authors

### DO:
✅ Use descriptive variable names: `{{client_industry:select:...}}` not `{{x:select:...}}`
✅ Provide sensible defaults where possible
✅ Use appropriate input types (number for numbers, date for dates)
✅ Keep forms under 10 fields for better UX
✅ Group related variables together in the prompt
✅ Use textarea for descriptions > 100 characters

### DON'T:
❌ Nest variables: `{{outer_{{inner:text}}:text}}` ❌
❌ Use special characters in variable names
❌ Create circular dependencies
❌ Expose sensitive default values
❌ Use overly generic labels like "Input 1"

## Migration Path

### Existing Prompts
- Remain fully compatible
- No variables = no form, direct insertion
- Gradual opt-in by adding variables

### Backward Compatibility
- Extensions without variable support show raw prompt
- Graceful degradation to manual editing
- Clear upgrade messaging

## Performance Considerations

### Parsing
- Cache parsed variable metadata
- Parse on prompt load, not on every render
- Lazy load form components

### Form Rendering
- Minimal re-renders on input change
- Debounce validation (300ms)
- Async validation for complex rules

### Storage
- Store completed prompts in history
- Cache form states for quick re-run
- Limit history to 50 entries

## Analytics & Metrics

Track:
- Variable usage rates per prompt pack
- Most common field types
- Average form completion time
- Abandonment rates
- Validation error rates

Use insights to improve:
- Default values
- Field ordering
- Validation messages
- Form UX

## Future Enhancements

### Conditional Fields
```
{{show_budget:select:Include Budget?:no|yes,no}}
{{budget:number:Budget Amount|condition:show_budget==yes}}
```

### Field Dependencies
```
{{country:select:Country:AU|AU,US,UK}}
{{state:select:State|depends:country}}
```

### Multi-step Forms
For prompts with 10+ variables, paginate:
```
{{page:1}}{{field1:text}}{{field2:text}}{{page:2}}{{field3:text}}
```

### Templates with Templates
Reference other prompts as includes:
```
{{include:legal_disclaimer}}
```

### AI-Assisted Completion
Suggest values based on:
- Previous entries
- User profile data
- Context from current page

---

**Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** 2025-11-05  
**Maintained by:** Lovable Platform Team
