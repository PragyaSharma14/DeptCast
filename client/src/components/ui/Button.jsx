import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

const buttonVariants = {
  default: "bg-brand hover:bg-brand/90 text-white shadow-[0_0_20px_var(--color-brand-glow)] hover:shadow-[0_0_30px_var(--color-brand-glow)]",
  secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
  outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300",
  ghost: "bg-transparent hover:bg-white/5 text-gray-300",
  danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
};

const buttonSizes = {
  sm: "h-9 px-4 text-sm",
  default: "h-11 px-6",
  lg: "h-14 px-8 text-lg",
  icon: "h-11 w-11 flex items-center justify-center p-0",
};

export const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false,
  children,
  isLoading,
  ...props 
}, ref) => {
  const Comp = asChild ? motion.button : motion.button;
  // Fallback to regular button if needed, but framer-motion adds the spring click effect
  return (
    <Comp
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Comp>
  );
});
Button.displayName = "Button";
