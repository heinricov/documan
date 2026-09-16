import type { MouseEventHandler } from "react"

import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldLabel,
  FieldSeparator,
} from "@packages/ui/components/field"
import { Button } from "@packages/ui/components/button"
import { cn } from "cn"

export function FieldLayout({
  className,
  buttonLabel = "Submit",
  cancelLabel = "Cancel",
  cancelOnclick,
  onSubmit,
  children,
  ...props
}: React.ComponentProps<"form"> & {
  buttonLabel?: string
  cancelLabel?: string
  cancelOnclick?: MouseEventHandler
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto my-10 w-full max-w-xl", className)}>
      <form onSubmit={onSubmit} {...props}>
        <FieldGroup>
          {children}
          <Field orientation="horizontal" className="flex justify-end">
            <FieldSeparator />
            {cancelOnclick ? (
              <Button type="button" variant="outline" onClick={cancelOnclick}>
                {cancelLabel}
              </Button>
            ) : null}
            <Button type="submit">{buttonLabel}</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export function FieldSetLayout({
  className,
  legend = "Label FieldSet",
  description = "Description FieldSet",
  ...props
}: React.ComponentProps<"fieldset"> & {
  legend?: string
  description?: string
}) {
  return (
    <FieldSet className={className} {...props}>
      <FieldLegend className="mb-2">{legend}</FieldLegend>
      <FieldLabel>{description}</FieldLabel>
      <FieldGroup>{props.children}</FieldGroup>
    </FieldSet>
  )
}
