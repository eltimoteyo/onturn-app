import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "blue" | "green" | "yellow" | "orange" | "purple" | "slate"
  color?: "blue" | "green" | "yellow" | "orange" | "purple" | "slate"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", color, ...props }, ref) => {
    const badgeColor = color || variant
    
    const colors = {
      blue: "bg-blue-50 text-[#003366] border-blue-100",
      green: "bg-teal-50 text-[#00A896] border-teal-100",
      yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      slate: "bg-slate-100 text-slate-600 border-slate-200",
      default: "bg-blue-50 text-[#003366] border-blue-100",
      success: "bg-teal-50 text-[#00A896] border-teal-100",
      warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
      destructive: "bg-red-50 text-red-700 border-red-200",
      outline: "border border-gray-300 bg-white text-gray-700",
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          "px-2 py-1 rounded-md text-xs font-bold border whitespace-nowrap",
          colors[badgeColor as keyof typeof colors] || colors.default,
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
