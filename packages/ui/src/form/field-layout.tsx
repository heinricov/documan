import type { MouseEventHandler, ReactNode } from "react"

import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldLabel,
  FieldSeparator,
  FieldError,
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
  isLoading = false,
  disabled = false,
  error,
  ...props
}: React.ComponentProps<"form"> & {
  buttonLabel?: string
  cancelLabel?: string
  cancelOnclick?: MouseEventHandler
  children: ReactNode
  isLoading?: boolean
  disabled?: boolean
  error?: string | string[]
}) {
  const isDisabled = disabled || isLoading

  return (
    <div className={cn("mx-auto my-10 w-full max-w-xl", className)}>
      <form onSubmit={onSubmit} {...props}>
        <FieldGroup>
          {children}

          {error ? (
            <FieldError
              errors={
                Array.isArray(error)
                  ? error.map((m) => ({ message: m }))
                  : [{ message: error }]
              }
            />
          ) : null}

          <FieldSeparator />

          <Field orientation="horizontal" className="flex justify-end gap-2">
            {cancelOnclick ? (
              <Button
                type="button"
                variant="outline"
                onClick={cancelOnclick}
                disabled={isDisabled}
              >
                {cancelLabel}
              </Button>
            ) : null}

            <Button type="submit" disabled={isDisabled}>
              {isLoading ? "Menyimpan..." : buttonLabel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export function FieldSetGroup({
  className,
  legend = "Label FieldSet",
  description,
  ...props
}: React.ComponentProps<"fieldset"> & {
  legend?: string
  description?: string
}) {
  return (
    <FieldSet className={className} {...props}>
      <FieldLegend className="mb-2">{legend}</FieldLegend>
      {description ? <FieldLabel>{description}</FieldLabel> : null}
      <FieldGroup>{props.children}</FieldGroup>
    </FieldSet>
  )
}
