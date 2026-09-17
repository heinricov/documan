"use client"

import React, { useId, useState } from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@packages/ui/components/button"
import { Calendar } from "@packages/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/popover"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@packages/ui/components/field"
import { cn } from "cn"

export function FieldDate({
  label = "Label Date",
  description,
  placeholder = "Pilih tanggal",
  error,
  required = false,
  disabled = false,
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  dateFormat = "PPP",
  className,
  ...props
}: {
  label?: string
  description?: string
  placeholder?: string
  error?: string | string[]
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  dateFormat?: string
  className?: string
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  // Support controlled & uncontrolled
  const [internalDate, setInternalDate] = useState<Date | undefined>(
    defaultValue
  )
  const date = value !== undefined ? value : internalDate

  const handleSelect = (selected: Date | undefined) => {
    if (value === undefined) {
      setInternalDate(selected)
    }
    onValueChange?.(selected)
  }

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>

      {/* Hidden input untuk FormData */}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={date ? date.toISOString() : ""}
        />
      ) : null}

      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={inputId}
              type="button"
              variant="outline"
              disabled={disabled}
              data-empty={!date}
              aria-describedby={describedBy}
              aria-invalid={!!error || undefined}
              aria-required={required || undefined}
              className={cn(
                "w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground",
                className
              )}
            >
              {date ? format(date, dateFormat) : <span>{placeholder}</span>}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
            disabled={disabled}
            {...props}
          />
        </PopoverContent>
      </Popover>

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
