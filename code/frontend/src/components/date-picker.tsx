import React, { useState, useEffect } from 'react';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TailwindCalendarProps {
    selected?: Date | null;
    onSelect: (date: Date) => void;
    disabledDates?: (date: Date) => boolean;
    minDate?: Date | null;
}

export function TailwindCalendar({
    selected,
    onSelect,
    disabledDates,
    minDate
}: TailwindCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(selected || new Date());

    // Set month based on selected date
    useEffect(() => {
        if (selected) {
            setCurrentMonth(selected);
        }
    }, [selected]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate weeks (for proper grid display)
    const weeks: Date[][] = [];
    let week: Date[] = [];

    // Add empty days for the start of the month
    const startDay = monthStart.getDay();
    for (let i = 0; i < startDay; i++) {
        week.push(new Date(0)); // Placeholder date
    }

    // Add actual days
    daysInMonth.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });

    // Add empty days for the end of the month
    if (week.length > 0) {
        for (let i = week.length; i < 7; i++) {
            week.push(new Date(0)); // Placeholder date
        }
        weeks.push(week);
    }

    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDayClick = (day: Date) => {
        if (day.getTime() === 0) return; // Skip placeholder dates

        if (disabledDates && disabledDates(day)) {
            return; // Skip disabled dates
        }

        onSelect(day);
    };

    return (
        <div className="bg-[#1a2234] rounded-lg shadow-lg overflow-hidden">
            {/* Header with month/year and navigation */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700"
                >
                    <ChevronLeft size={18} />
                </button>
                <h2 className="text-lg font-medium text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
                {/* Days of week header */}
                <div className="grid grid-cols-7 mb-1">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                        {week.map((day, dayIndex) => {
                            const isPlaceholder = day.getTime() === 0;
                            const isDisabled = !isPlaceholder && disabledDates ? disabledDates(day) : false;
                            const isSelectedDay = selected ? isSameDay(day, selected) : false;
                            const isTodayDate = !isPlaceholder && isToday(day);

                            return (
                                <div
                                    key={dayIndex}
                                    className="p-1 relative"
                                >
                                    <button
                                        type="button"
                                        disabled={isPlaceholder || isDisabled}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                          w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm
                                          ${isPlaceholder ? 'invisible' : ''}
                                          ${isDisabled ? 'text-gray-600 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}
                                          ${isSelectedDay ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                          ${!isSelectedDay && !isDisabled && !isPlaceholder ? 'text-gray-300 hover:text-white' : ''}
                                          ${isTodayDate && !isSelectedDay ? 'border border-blue-400 bg-blue-400/10' : ''}
                                        `}
                                    >
                                        {!isPlaceholder && format(day, 'd')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
