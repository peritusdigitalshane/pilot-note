import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

type PricingPlansProps = {
  onSelectFree: () => void;
  onSelectPro: () => void;
  loading?: boolean;
};

export const PricingPlans = ({ onSelectFree, onSelectPro, loading }: PricingPlansProps) => {
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "10 AI conversations per month",
        "5 custom AI models",
        "1 knowledge base (max 50 documents)",
        "5 voice transcriptions per month",
        "10 notes storage",
        "Community support",
        "Access to free prompt packs only",
      ],
      buttonText: "Start Free",
      onSelect: onSelectFree,
      disabled: loading,
    },
    {
      name: "Pro",
      price: "$29",
      description: "For power users and professionals",
      features: [
        "Unlimited AI conversations",
        "Unlimited custom AI models",
        "Unlimited knowledge bases with RAG",
        "Unlimited voice transcriptions",
        "Unlimited notes storage",
        "Priority support",
        "Access to all premium prompt packs",
        "Organization sharing & collaboration",
        "Advanced analytics & insights",
        "API access",
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
      onSelect: onSelectPro,
      disabled: loading,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`glass-card relative ${
            plan.popular ? "border-primary shadow-lg" : ""
          }`}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={plan.onSelect}
              disabled={plan.disabled}
            >
              {plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
