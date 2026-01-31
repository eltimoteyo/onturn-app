import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "accent" | "secondary"
  size?: "default" | "sm" | "lg"
  icon?: LucideIcon
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", icon: Icon, fullWidth = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 transform active:scale-95 border select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#003366] text-white border-transparent hover:bg-[#002244] shadow-lg shadow-blue-900/10": variant === "default",
            "bg-white text-[#003366] border-[#003366] hover:bg-slate-50": variant === "outline" || variant === "secondary",
            "bg-transparent text-[#003366] border-transparent shadow-none hover:bg-slate-100": variant === "ghost",
            "bg-red-600 text-white border-transparent hover:bg-red-700 shadow-lg": variant === "destructive",
            "bg-[#00A896] text-white border-transparent hover:bg-[#008f7f] shadow-lg shadow-teal-900/10": variant === "accent",
            "h-10 px-6 py-2": size === "default",
            "h-9 px-3 py-1.5 text-sm": size === "sm",
            "h-12 px-8 py-4 text-lg": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {Icon && <Icon size={size === "lg" ? 24 : 20} />}
        {props.children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
