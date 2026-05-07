// src/components/ui/input.tsx
import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-10 w-full rounded-md border px-3 py-2 text-sm outline-none ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
