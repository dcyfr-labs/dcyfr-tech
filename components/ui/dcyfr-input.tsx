import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

// Brand-aligned input with built-in validation states and surface variants.
// Tokens come from the consumer app's design-tokens layer; never hardcode.
const dcyfrInputVariants = cva(
  "flex h-12 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm transition-[color,background,border,box-shadow] duration-200",
  {
    variants: {
      variant: {
        default:
          "border-input hover:border-ring/50 focus:border-ring focus-visible:ring-ring",
        secure:
          "border-secure/40 bg-secure/5 hover:border-secure/60 focus:border-secure focus-visible:ring-secure/30",
        ghostly:
          "border-transparent bg-muted/40 hover:bg-muted/60 focus:bg-background focus:border-ring focus-visible:ring-ring/40",
      },
      state: {
        idle: "",
        error:
          "border-destructive pr-10 hover:border-destructive focus:border-destructive focus-visible:ring-destructive/20",
        success:
          "border-success pr-10 hover:border-success focus:border-success focus-visible:ring-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "idle",
    },
  }
)

export interface DcyfrInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Pick<VariantProps<typeof dcyfrInputVariants>, "variant"> {
  /** Error message to display (also applies error styling + aria-invalid) */
  error?: string | null
  /** Show success indicator */
  success?: boolean
  /** Wrapper div className for error/success message positioning */
  wrapperClassName?: string
}

const DcyfrInput = React.forwardRef<HTMLInputElement, DcyfrInputProps>(
  (
    {
      className,
      type,
      variant,
      error,
      success,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error && error.trim() !== "")
    const showSuccess = Boolean(success && !hasError)
    const state = hasError ? "error" : showSuccess ? "success" : "idle"

    if (state === "idle") {
      return (
        <input
          id={id}
          type={type}
          ref={ref}
          className={cn(dcyfrInputVariants({ variant, state, className }))}
          {...props}
        />
      )
    }

    return (
      <div className={cn("relative", wrapperClassName)}>
        <input
          id={id}
          type={type}
          ref={ref}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={hasError && id ? `${id}-error` : undefined}
          className={cn(dcyfrInputVariants({ variant, state, className }))}
          {...props}
        />
        {showSuccess && (
          <CheckCircle2
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success"
          />
        )}
        {hasError && (
          <AlertCircle
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive"
          />
        )}
        {hasError && (
          <p
            id={id ? `${id}-error` : undefined}
            role="alert"
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
DcyfrInput.displayName = "DcyfrInput"

export { DcyfrInput, dcyfrInputVariants }
