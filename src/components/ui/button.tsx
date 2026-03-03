import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 sm:[&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
        variant: {
          default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:shadow-primary/20",
          destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/20",
          outline:
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:shadow-sm",
          secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
          glow: "bg-gradient-primary text-primary-foreground hover:shadow-beam hover:scale-[1.05] border border-primary/30 hover:border-primary/60",
          premium: "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-primary-foreground hover:bg-[right_center] hover:shadow-luxury hover:scale-[1.05] transition-all duration-700",
        },
        size: {
          default: "h-9 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2",
          sm: "h-8 sm:h-9 rounded-md px-2.5 sm:px-3 text-[11px] sm:text-xs",
          lg: "h-10 sm:h-11 md:h-12 rounded-md px-5 sm:px-6 md:px-8 text-sm sm:text-base",
          icon: "h-9 w-9 sm:h-10 sm:w-10",
        },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
