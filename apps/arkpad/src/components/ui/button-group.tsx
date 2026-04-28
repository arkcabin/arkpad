import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonGroupVariants = cva("inline-flex items-center rounded-xl shadow-sm", {
  variants: {
    variant: {
      default: "bg-slate-100 border border-slate-200",
      dark: "bg-slate-800 border border-slate-700",
    },
    size: {
      sm: "h-8 gap-0.5 p-0.5",
      default: "h-10 gap-0.5 p-0.5",
      lg: "h-12 gap-1 p-1",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div ref={ref} className={buttonGroupVariants({ variant, size, className })} {...props} />
  )
);
ButtonGroup.displayName = "ButtonGroup";

const buttonGroupItemVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-slate-600 hover:bg-white hover:text-slate-900",
        dark: "text-slate-400 hover:bg-slate-700 hover:text-white",
        active: "bg-white text-slate-900 shadow-sm",
        activeDark: "bg-slate-600 text-white shadow-sm",
      },
      size: {
        sm: "h-7 w-7",
        default: "h-8 w-8",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonGroupItemProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonGroupItemVariants> {
  isActive?: boolean;
}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, variant, size, isActive, ...props }, ref) => {
    const isDarkVariant = variant === "activeDark" || variant === "dark";
    return (
      <button
        ref={ref}
        className={buttonGroupItemVariants({
          variant: isActive ? (isDarkVariant ? "activeDark" : "active") : variant,
          size,
          className,
        })}
        {...props}
      />
    );
  }
);
ButtonGroupItem.displayName = "ButtonGroupItem";

export { ButtonGroup, ButtonGroupItem };
