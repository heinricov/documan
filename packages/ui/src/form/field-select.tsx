"use client"

import React, { useId } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@packages/ui/components/combobox"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@packages/ui/components/field"

type Option = string | { label: string; value: string }

export function FieldSelect({
  label = "Label Select",
  description,
  placeholder = "Pilih opsi...",
  emptyMessage = "Tidak ada item ditemukan.",
  options = [],
  error,
  required = false,
  disabled = false,
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: {
  label?: string
  description?: string
  placeholder?: string
  emptyMessage?: string
  options?: Option[]
  error?: string | string[]
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | null) => void
  className?: string
} & Omit<
  React.ComponentProps<typeof Combobox>,
  "items" | "value" | "defaultValue" | "onValueChange" | "children"
>) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  // Normalisasi options ke string[] untuk Combobox items
  const items = options.map((opt) =>
    typeof opt === "string" ? opt : opt.value
  )

  // Map value → label untuk tampilan
  const getLabel = (val: string) => {
    const found = options.find((opt) =>
      typeof opt === "string" ? opt === val : opt.value === val
    )
    if (!found) return val
    return typeof found === "string" ? found : found.label
  }

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>

      <Combobox
        items={items}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val, _eventDetails) => {
          // Adaptasi tipe: Combobox mengirim unknown, kita cast ke string | null
          onValueChange?.(val as string | null)
        }}
        disabled={disabled}
        {...props}
      >
        <ComboboxInput
          id={inputId}
          name={name}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          aria-required={required || undefined}
          className={className}
          disabled={disabled}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {getLabel(String(item))}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

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
