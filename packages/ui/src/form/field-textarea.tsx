import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
  InputGroupText,
} from "@packages/ui/components/input-group"

import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@packages/ui/components/field"

export function FieldTextArea({
  label = "Label Input text area",
  description = "Description Input text area",
  placeholder = "Field text area here",
  ...props
}: React.ComponentProps<typeof InputGroupTextarea> & {
  label?: string
  description?: string
  placeholder?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor="inline-start-input">{label}</FieldLabel>
      <InputGroup>
        <InputGroupTextarea placeholder={placeholder} {...props} />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-xs text-muted-foreground">
            120 characters left
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>{description}</FieldDescription>
    </Field>
  )
}
