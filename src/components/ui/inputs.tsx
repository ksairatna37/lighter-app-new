import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency: string;
  max?: string;
  showPercentageButtons?: boolean;
  className?: string;
  placeholder?: string;
}

export const AmountInput = ({
  label,
  value,
  onChange,
  currency,
  max,
  showPercentageButtons = false,
  className,
  placeholder = "0.00"
}: AmountInputProps) => {
  const handlePercentage = (percentage: number) => {
    if (max) {
      const amount = (parseFloat(max) * percentage / 100).toString();
      onChange(amount);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-16 text-lg font-medium bg-card border-border/50 focus:border-accent-primary"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currency}
        </div>
      </div>

      {showPercentageButtons && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePercentage(25)}
            className="flex-1 text-xs"
          >
            25%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePercentage(50)}
            className="flex-1 text-xs"
          >
            50%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePercentage(75)}
            className="flex-1 text-xs"
          >
            75%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePercentage(100)}
            className="flex-1 text-xs"
          >
            MAX
          </Button>
        </div>
      )}

      {max && (
        <div className="text-xs text-muted-foreground">
          Available: {max} {currency}
        </div>
      )}
    </div>
  );
};

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showCopyButton?: boolean;
  validate?: boolean;
  className?: string;
}

export const AddressInput = ({
  label,
  value,
  onChange,
  placeholder = "0x...",
  showCopyButton = false,
  validate = false,
  className
}: AddressInputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isValidAddress = value.length === 42 && value.startsWith('0x');

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "font-mono text-sm bg-card border-border/50 focus:border-accent-primary",
            showCopyButton && "pr-20",
            validate && value && (isValidAddress ? "border-success" : "border-error")
          )}
        />
        
        {showCopyButton && value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
          >
            {copied ? "✓" : "📋"}
          </Button>
        )}
      </div>

      {validate && value && !isValidAddress && (
        <div className="text-xs text-error">
          Invalid address format
        </div>
      )}
    </div>
  );
};