import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base Styles
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          variant === "default" && "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-red-600 dark:text-zinc-50 dark:hover:bg-red-700 dark:shadow-[0_0_15px_rgba(220,38,38,0.5)]",
          variant === "outline" && "border border-zinc-200 bg-background hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
          variant === "destructive" && "bg-red-500 text-zinc-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-red-200",
          variant === "ghost" && "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }