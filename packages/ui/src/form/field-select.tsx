"use client"

import React, { useId } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select"
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
  emptyMessage = "Tidak ada opsi tersedia.",
  options = [],
  icon,
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
  icon?: React.ReactNode | null
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
  React.ComponentProps<typeof Select>,
  "value" | "defaultValue" | "onValueChange" | "children" | "items"
>) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  // Build items Record<string, React.ReactNode> untuk SelectRoot
  // Agar SelectValue otomatis menampilkan label bukan raw value
  const itemsMap: Record<string, React.ReactNode> = {}
  for (const opt of options) {
    if (typeof opt === "string") {
      itemsMap[opt] = opt
    } else {
      itemsMap[opt.value] = opt.label
    }
  }

  // Build SelectItem children dari options
  const selectItems = options.map((opt) => {
    const val = typeof opt === "string" ? opt : opt.value
    const lbl = typeof opt === "string" ? opt : opt.label
    return (
      <SelectItem key={val} value={val}>
        {lbl}
      </SelectItem>
    )
  })

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>

      <Select
        items={itemsMap}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val) => {
          onValueChange?.(val as string | null)
        }}
        disabled={disabled}
        name={name}
        required={required}
        {...props}
      >
        <SelectTrigger
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          aria-required={required || undefined}
          className={className}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {selectItems.length > 0 ? (
            selectItems
          ) : (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </SelectContent>
      </Select>

      {icon ? (
        <span className="text-muted-foreground mt-1 inline-block">{icon}</span>
      ) : null}

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
