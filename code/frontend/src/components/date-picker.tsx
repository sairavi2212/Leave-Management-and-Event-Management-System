import * as React from "react"
import { format, isValid, startOfToday } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Single date picker
export function DatePicker({
  date,
  setDate,
  disabled,
  disabledDates,
  placeholder = "Pick a date",
  className
}: {
  date: Date | undefined,
  setDate: (date: Date | undefined) => void,
  disabled?: boolean,
  disabledDates?: Date[] | ((date: Date) => boolean),
  placeholder?: string,
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && isValid(date) ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabledDates}
          footer={
            <div className="flex justify-between mt-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDate(startOfToday())
                  setIsOpen(false)
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDate(undefined)
                  setIsOpen(false)
                }}
              >
                Clear
              </Button>
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  )
}

// Date range picker
export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  disabled,
  disabledDates,
  className
}: {
  dateRange: DateRange,
  setDateRange: (dateRange: DateRange) => void,
  disabled?: boolean,
  disabledDates?: Date[] | ((date: Date) => boolean),
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(selectedRange) => {
              setDateRange({
                from: selectedRange?.from,
                to: selectedRange?.to,
              })
              if (selectedRange?.from && selectedRange?.to) {
                setIsOpen(false)
              }
            }}
            numberOfMonths={2}
            disabled={disabledDates}
            footer={
              <div className="flex justify-between mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = startOfToday()
                    setDateRange({ from: today, to: today })
                    setIsOpen(false)
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined })
                    setIsOpen(false)
                  }}
                >
                  Clear
                </Button>
              </div>
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Month picker component
export function MonthYearPicker({
  date,
  setDate,
  disabled,
  className
}: {
  date: Date | undefined,
  setDate: (date: Date | undefined) => void,
  disabled?: boolean,
  className?: string
}) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentDate = date || new Date()
  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(parseInt(monthIndex))
    setDate(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(year))
    setDate(newDate)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        disabled={disabled}
        value={currentDate.getMonth().toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        disabled={disabled}
        value={currentDate.getFullYear().toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}