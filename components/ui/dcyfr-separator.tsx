"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const dcyfrSeparatorVariants = cva(
  "shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
  {
    variants: {
      variant: {
        default: "bg-border",
        gradient:
          "bg-gradient-to-r from-transparent via-border to-transparent data-[orientation=vertical]:bg-gradient-to-b",
        dashed:
          "bg-transparent border-dashed border-border data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface DcyfrSeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof dcyfrSeparatorVariants> {}

function DcyfrSeparator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant,
  ...props
}: DcyfrSeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(dcyfrSeparatorVariants({ variant, className }))}
      {...props}
    />
  )
}

export { DcyfrSeparator, dcyfrSeparatorVariants }
