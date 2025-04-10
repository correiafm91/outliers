
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        verified: 
          "border-transparent bg-green-500/20 text-green-600 hover:bg-green-500/30 flex items-center gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Special verified badge that includes the check icon
function VerifiedBadge({ className, ...props }: Omit<BadgeProps, 'variant'>) {
  return (
    <Badge variant="verified" className={cn("inline-flex items-center", className)} {...props}>
      <Check className="h-3 w-3" />
      <span>Verificado</span>
    </Badge>
  );
}

export { Badge, badgeVariants, VerifiedBadge };
