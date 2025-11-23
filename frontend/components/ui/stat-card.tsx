import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
  iconColor?: string;
  iconBg?: string;
  decorativeCircle?: boolean;
}

/**
 * StatCard component matching apartments dashboard style
 * Features:
 * - Rounded-xl corners
 * - Semi-transparent background with backdrop blur
 * - Decorative circle in corner (optional)
 * - Hover border color change
 * - Smooth transitions
 */
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    icon: Icon, 
    title, 
    value, 
    description,
    iconColor = "text-blue-400",
    iconBg = "bg-blue-500/10",
    decorativeCircle = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base card styling - modern subtle design
          "relative overflow-hidden",
          "rounded-xl",
          // Dark background with backdrop blur
          "bg-card/80 backdrop-blur-sm",
          // Subtle gray border
          "border border-border/30",
          "shadow-xl",
          "p-4 md:p-6",
          "transition-all duration-300",
          "group",
          // Hover - subtle border highlight
          "hover:border-border/60 hover:shadow-2xl",
          className
        )}
        {...props}
      >
        {/* Decorative circle in corner */}
        {decorativeCircle && (
          <div className={cn(
            "absolute top-0 right-0",
            "w-20 h-20",
            iconBg,
            "rounded-full",
            "-mr-10 -mt-10",
            "group-hover:scale-110",
            "transition-all duration-500"
          )} />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <Icon className={cn("h-5 w-5", iconColor)} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
          </div>
          <p className={cn("text-3xl font-bold", iconColor)}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }

