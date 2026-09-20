import React, { useId } from "react"

import {
  InputGroup,
  InputGroupTextarea,
} from "@packages/ui/components/input-group"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@packages/ui/components/field"

export function FieldTextArea({
  label = "Label Input text area",
  description,
  placeholder = "Field text area here",
  error,
  required = false,
  maxLength,
  id,
  className,
  ...props
}: React.ComponentProps<typeof InputGroupTextarea> & {
  label?: string
  description?: string
  error?: string | string[]
  required?: boolean
  maxLength?: number
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>

      <InputGroup>
        <InputGroupTextarea
          id={inputId}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          aria-required={required || undefined}
          maxLength={maxLength}
          className={className}
          {...props}
        />

      </InputGroup>

      {description && descriptionId ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}

      {error ? (
        <FieldError
          id={errorId}
          errors={
            Array.isArray(error)
              ? error.map((m) => ({ message: m }))
              : [{ message: error }]
          }
        />
      ) : null}
    </Field>
  )
}
