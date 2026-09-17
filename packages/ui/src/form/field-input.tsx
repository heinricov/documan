import React, { useId } from "react"
import { FaPencilAlt } from "react-icons/fa"

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@packages/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@packages/ui/components/input-group"

export function FieldInput({
  label = "Label Input",
  description,
  type = "text",
  placeholder = "Field input here",
  icon = <FaPencilAlt />,
  error,
  required = false,
  id,
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  label?: string
  description?: string
  icon?: React.ReactNode | null
  error?: string | string[]
  required?: boolean
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
        <InputGroupInput
          id={inputId}
          type={type}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          aria-required={required || undefined}
          className={className}
          {...props}
        />
        {icon ? <InputGroupAddon>{icon}</InputGroupAddon> : null}
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
