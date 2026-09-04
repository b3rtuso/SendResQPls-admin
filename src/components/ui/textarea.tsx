import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={{
        paddingLeft: '12px',
        paddingRight: '12px',
        ...style,
      }}
      {...props}
    />
  )
}

export { Textarea }
