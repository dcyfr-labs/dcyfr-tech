import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The shimmer variant uses a gradient sweep inline so consumers don't need to
// ship an extra keyframe in their globals.css. Respects reduced-motion.
const dcyfrSkeletonVariants = cva(
  "rounded-md bg-muted motion-reduce:animate-none",
  {
    variants: {
      variant: {
        default: "animate-pulse",
        shimmer:
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/10 before:to-transparent",
        text: "h-4 w-full animate-pulse",
        circle: "rounded-full animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface DcyfrSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dcyfrSkeletonVariants> {}

function DcyfrSkeleton({
  className,
  variant,
  ...props
}: DcyfrSkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(dcyfrSkeletonVariants({ variant, className }))}
      {...props}
    />
  )
}

export { DcyfrSkeleton, dcyfrSkeletonVariants }
