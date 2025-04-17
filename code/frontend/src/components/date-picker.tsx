import * as React from "react"
import { format, isValid, startOfToday, addYears, getYear, getMonth, addMonths } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Day display component
const DayButton = ({ 
  day,
  month,
  selected,
  isToday,
  inCurrentMonth = true,
  onClick,
  disabled = false
}: { 
  day: number,
  month: Date,
  selected: boolean,
  isToday: boolean,
  inCurrentMonth?: boolean,
  onClick: () => void,
  disabled?: boolean
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
        inCurrentMonth ? "text-gray-200" : "text-gray-500",
        selected && "bg-blue-600 text-white font-medium hover:bg-blue-700",
        isToday && !selected && "border border-blue-500 font-medium",
        !selected && !disabled && inCurrentMonth && "hover:bg-gray-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {day}
    </button>
  )
}

// Calendar component with proper layout
function CalendarComponent({
  selectedDate,
  onDateSelect,
  disabledDates,
}: {
  selectedDate?: Date,
  onDateSelect: (date: Date) => void,
  disabledDates?: Date[] | ((date: Date) => boolean),
}) {
  const [viewDate, setViewDate] = React.useState<Date>(selectedDate || startOfToday());
  
  // Get days in current month view
  const getDaysInMonth = () => {
    const year = getYear(viewDate);
    const month = getMonth(viewDate);
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Adjust Sunday to be 7
    
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek - 1;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // Calendar days array
    const days = [];
    
    // Add days from previous month
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = prevMonthDays - daysFromPrevMonth + i + 1;
      days.push({
        day,
        date: new Date(year, month - 1, day),
        inCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        inCurrentMonth: true
      });
    }
    
    // Add days from next month (to complete the calendar grid)
    const totalDaysNeeded = 42; // 6 rows of 7 days
    const daysFromNextMonth = totalDaysNeeded - days.length;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        inCurrentMonth: false
      });
    }
    
    return days;
  };
  
  // Check if date is disabled
  const isDisabled = (date: Date) => {
    if (!disabledDates) return false;
    if (typeof disabledDates === 'function') {
      return disabledDates(date);
    }
    return disabledDates.some(disabledDate => 
      disabledDate.getFullYear() === date.getFullYear() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getDate() === date.getDate()
    );
  };
  
  // Check if date is the selected date
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };
  
  // Check if date is today
  const isDateToday = (date: Date) => {
    const today = startOfToday();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };
  
  const days = getDaysInMonth();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <div className="p-3 bg-[#1e293b]">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setViewDate(prev => addMonths(prev, -1))}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-white font-medium">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setViewDate(prev => addMonths(prev, 1))}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-gray-400 text-sm font-medium text-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ day, date, inCurrentMonth }) => (
          <div key={`${date.toISOString()}`} className="flex justify-center p-1">
            <DayButton
              day={day}
              month={viewDate}
              selected={isSelected(date)}
              isToday={isDateToday(date)}
              inCurrentMonth={inCurrentMonth}
              disabled={isDisabled(date)}
              onClick={() => onDateSelect(date)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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
            "w-full h-12 justify-start text-left font-normal",
            !date && "text-muted-foreground",
            date && "text-white",
            "bg-[#2d3748] border-gray-700 hover:bg-[#3a4a5f] hover:border-gray-600",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-300" />
          {date && isValid(date) ? format(date, "dd/MM/yyyy") : <span className="text-gray-400">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1e293b] border border-gray-700 shadow-lg" align="start">
        <CalendarComponent
          selectedDate={date}
          onDateSelect={(selected) => {
            setDate(selected);
            setIsOpen(false);
          }}
          disabledDates={disabledDates}
        />
        <div className="flex justify-between border-t border-gray-700 p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDate(startOfToday())
              setIsOpen(false)
            }}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#2d3748] hover:text-white"
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
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#2d3748] hover:text-white"
          >
            Clear
          </Button>
        </div>
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
  const [currentView, setCurrentView] = React.useState<'from' | 'to'>('from')

  const handleSelect = (selected: Date) => {
    if (currentView === 'from' || !dateRange.from) {
      setDateRange({
        from: selected,
        to: dateRange.to && selected <= dateRange.to ? dateRange.to : undefined
      });
      setCurrentView('to');
    } else {
      // Selecting "to" date
      if (selected >= dateRange.from) {
        setDateRange({
          from: dateRange.from,
          to: selected
        });
        setIsOpen(false);
      } else {
        // If selected date is before "from" date, swap them
        setDateRange({
          from: selected,
          to: dateRange.from
        });
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full h-12 justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
              dateRange.from && "text-white",
              "bg-[#2d3748] border-gray-700 hover:bg-[#3a4a5f] hover:border-gray-600"
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-300" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span className="text-gray-400">Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#1e293b] border border-gray-700" align="start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            <div>
              <p className="text-sm text-gray-400 mb-1 ml-1">
                {currentView === 'from' ? 'Select start date' : 'Select end date'}
              </p>
              <CalendarComponent
                selectedDate={dateRange.from}
                onDateSelect={handleSelect}
                disabledDates={disabledDates}
              />
            </div>
            {/* Second month view for larger screens */}
            <div className="hidden md:block">
              <p className="text-sm text-gray-400 mb-1 ml-1">
                &nbsp;
              </p>
              <CalendarComponent
                selectedDate={dateRange.from ? addMonths(dateRange.from, 1) : startOfToday()}
                onDateSelect={handleSelect}
                disabledDates={disabledDates}
              />
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-700 p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = startOfToday()
                setDateRange({ from: today, to: today })
                setIsOpen(false)
              }}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#2d3748] hover:text-white"
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
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#2d3748] hover:text-white"
            >
              Clear
            </Button>
          </div>
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
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(date ? getYear(date) : getYear(new Date()))

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const currentDate = date || new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Generate array of years (5 before current year, 5 after)
  const yearsToShow = 10
  const startYear = viewYear - Math.floor(yearsToShow / 2)
  const years = Array.from({ length: yearsToShow }, (_, i) => startYear + i)

  const handleYearChange = (year: number) => {
    setViewYear(year)
  }

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(viewYear, month, 1)
    setDate(newDate)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full h-12 justify-start text-left font-normal",
            !date && "text-muted-foreground",
            date && "text-white",
            "bg-[#2d3748] border-gray-700 hover:bg-[#3a4a5f] hover:border-gray-600",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-300" />
          {date && isValid(date) ? format(date, "MMMM yyyy") : <span className="text-gray-400">Select month</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-[#1e293b] border border-gray-700" align="start">
        <div className="p-3">
          {/* Year navigation */}
          <div className="flex justify-between items-center mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewYear(prev => prev - yearsToShow)}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-white font-medium text-sm">
              {years[0]} - {years[years.length - 1]}
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewYear(prev => prev + yearsToShow)}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Year selection */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {years.map(year => (
              <Button
                key={year}
                variant="ghost"
                size="sm"
                onClick={() => handleYearChange(year)}
                className={cn(
                  "text-sm",
                  year === viewYear ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                {year}
              </Button>
            ))}
          </div>
          
          {/* Month selection */}
          <h3 className="text-gray-400 text-sm mb-2">
            {viewYear}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant="ghost"
                size="sm"
                onClick={() => handleMonthSelect(index)}
                className={cn(
                  "text-sm",
                  viewYear === currentYear && index === currentMonth && date && viewYear === getYear(date) ? 
                    "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                {month.substring(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}