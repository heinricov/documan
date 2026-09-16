import React from "react"
import { useId } from "react"
import { FaPencilAlt } from "react-icons/fa"

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@packages/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@packages/ui/components/input-group"

export function FieldInput({
  label = "Label Input",
  description = "Description Input",
  type = "text",
  placeholder = "Field input here",
  icon = <FaPencilAlt />,
  id,
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  label?: string
  description?: string
  icon?: React.ReactNode
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-description` : undefined

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={inputId}
          type={type}
          placeholder={placeholder}
          aria-describedby={descriptionId}
          className={className}
          {...props}
        />
        {icon ? <InputGroupAddon>{icon}</InputGroupAddon> : null}
      </InputGroup>
      {description && descriptionId ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  )
}
