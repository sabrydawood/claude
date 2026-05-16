"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "flex h-12 w-full rounded-2xl border-2 bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text)] transition-all duration-200",
            "placeholder:text-[var(--text-muted)]",
            "rtl:text-right ltr:text-left",
            "focus:outline-none focus:border-[var(--zkawi-pink)] focus:ring-2 focus:ring-[var(--zkawi-pink)]/10",
            error ? "border-[var(--zkawi-red)]" : "border-[var(--border)]",
            icon && "ps-10",
            className,
          )}
          type={type === "password" && passwordVisible ? "text" : type}
          ref={ref}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute inset-y-0 end-3 flex items-center text-[var(--text-muted)]"
          >
            {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {error && (
          <p className="mt-1 text-sm text-[var(--zkawi-red)]">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
export { Input };
