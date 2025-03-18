import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { CalendarIcon, CheckCircle2, LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from "@/components/layout";
import { useSidebar } from '@/components/ui/sidebar';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';



// Custom Calendar Component - Completely built with Tailwind CSS
const TailwindCalendar = ({
    selected,
    onSelect,
    disabledDates,
}: {
    selected?: Date | null,
    onSelect: (date: Date) => void,
    disabledDates?: (date: Date) => boolean,
    minDate?: Date | null
}) => {
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
};

const formSchema = z.object({
    leaveType: z.string().nonempty("Please select a leave type"),
    startDate: z.date({
        required_error: "Please select a start date",
    }),
    endDate: z.date({
        required_error: "Please select an end date",
    }),
    reason: z.string().nonempty("Please provide a reason for your leave"),
}).refine((data) => {
    return !data.startDate || !data.endDate || data.endDate >= data.startDate;
}, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

const Leaves: React.FC = () => {

    let isSidebarOpen = false;
    try {
        // Try to get the sidebar context safely
        const context = useSidebar();
        isSidebarOpen = context.open;
    } catch (error) {
        console.log("Sidebar context not available, using default state");
        // Use default false value
    }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [leaveDuration, setLeaveDuration] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    });

    // Calculate leave duration
    useEffect(() => {
        const startDate = form.watch('startDate');
        const endDate = form.watch('endDate');

        if (startDate && endDate) {
            // Add 1 to include both start and end days
            const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            setLeaveDuration(days);
        } else {
            setLeaveDuration(null);
        }
    }, [form.watch('startDate'), form.watch('endDate')]);

    // Close calendars when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showStartCalendar || showEndCalendar) {
                const target = event.target as HTMLElement;
                if (!target.closest('.calendar-wrapper')) {
                    setShowStartCalendar(false);
                    setShowEndCalendar(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStartCalendar, showEndCalendar]);

   // Update your onSubmit function with this improved version
async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        const formattedData = {
            ...values,
            startDate: format(values.startDate, "yyyy-MM-dd"),
            endDate: format(values.endDate, "yyyy-MM-dd"),
            status: "pending",
            submittedAt: new Date().toISOString(),
        };

        const response = await fetch('http://localhost:5000/api/leaves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit leave request');
        }

        setSubmitted(true);
        
        // Improved form reset logic
        setTimeout(() => {
            form.reset({
                leaveType: undefined,
                startDate: undefined,
                endDate: undefined,
                reason: "",
            });
            setLeaveDuration(null);
            setShowStartCalendar(false);
            setShowEndCalendar(false);
            setSubmitted(false);
        }, 3000);

    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to submit leave application. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
}

    return (
        <Layout>
            <div className={`py-8 px-120 flex justify-center`}>
                <div className={`w-full`}>
                    <Card className="shadow-xl bg-[#1e293b] border-0 text-white">
                        <CardHeader className="pb-6 pt-8 border-b border-gray-700">
                            <CardTitle className="text-2xl font-medium text-center text-white">
                                Leave Application Form
                            </CardTitle>
                            <CardDescription className="text-center text-base text-gray-300">
                                Submit your leave request for approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-8 md:px-8">
                            {submitted ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
                                    <h3 className="text-xl font-medium mb-2 text-white">
                                        Application Submitted Successfully
                                    </h3>
                                    <p className="text-gray-300 text-lg">
                                        Your request has been sent for approval. You will be notified once it is reviewed.
                                    </p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="leaveType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base text-gray-200">Leave Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 text-base bg-[#2d3748] border-gray-700 text-white">
                                                                <SelectValue placeholder="Select leave type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#2d3748] border-gray-700 text-white">
                                                            <SelectItem value="sick" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Sick Leave
                                                            </SelectItem>
                                                            <SelectItem value="casual" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Casual Leave
                                                            </SelectItem>
                                                            <SelectItem value="earned" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Earned Leave
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="relative">
                                                        <FormLabel className="text-base text-gray-200">Start Date</FormLabel>
                                                        <div className="calendar-wrapper">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowStartCalendar(!showStartCalendar);
                                                                    setShowEndCalendar(false);
                                                                }}
                                                                className="h-12 w-full flex items-center justify-between px-4 bg-[#2d3748] border border-gray-700 text-white rounded-md hover:bg-[#3b4758]"
                                                            >
                                                                <span>
                                                                    {field.value ? (
                                                                        format(field.value, "EEEE, MMMM d, yyyy")
                                                                    ) : (
                                                                        "Pick a start date"
                                                                    )}
                                                                </span>
                                                                <CalendarIcon className="h-5 w-5 opacity-50" />
                                                            </button>

                                                            {showStartCalendar && (
                                                                <div className="absolute z-50 mt-2 calendar-wrapper">
                                                                    <TailwindCalendar
                                                                        selected={field.value || undefined}
                                                                        onSelect={(date) => {
                                                                            field.onChange(date);
                                                                            setShowStartCalendar(false);
                                                                            // Reset end date if it's before new start date
                                                                            const endDate = form.getValues("endDate");
                                                                            if (endDate && date > endDate) {
                                                                                form.setValue("endDate", null as any);
                                                                            }
                                                                        }}
                                                                        disabledDates={(date) => {
                                                                            const today = new Date();
                                                                            today.setHours(0, 0, 0, 0);
                                                                            return date < today;
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem className="relative">
                                                        <FormLabel className="text-base text-gray-200">End Date</FormLabel>
                                                        <div className="calendar-wrapper">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowEndCalendar(!showEndCalendar);
                                                                    setShowStartCalendar(false);
                                                                }}
                                                                className="h-12 w-full flex items-center justify-between px-4 bg-[#2d3748] border border-gray-700 text-white rounded-md hover:bg-[#3b4758]"
                                                                disabled={!form.watch('startDate')}
                                                            >
                                                                <span>
                                                                    {field.value ? (
                                                                        format(field.value, "EEEE, MMMM d, yyyy")
                                                                    ) : (
                                                                        "Pick an end date"
                                                                    )}
                                                                </span>
                                                                <CalendarIcon className="h-5 w-5 opacity-50" />
                                                            </button>

                                                            {showEndCalendar && (
                                                                <div className="absolute z-50 mt-2 calendar-wrapper">
                                                                    <TailwindCalendar
                                                                        selected={field.value || undefined}
                                                                        onSelect={(date) => {
                                                                            field.onChange(date);
                                                                            setShowEndCalendar(false);
                                                                        }}
                                                                        disabledDates={(date) => {
                                                                            const startDate = form.getValues("startDate");
                                                                            if (!startDate) return true;
                                                                            return date < startDate;
                                                                        }}
                                                                        minDate={form.watch('startDate')}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Show leave duration */}
                                        {leaveDuration && (
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 flex items-center space-x-3">
                                                <div className="bg-blue-500/20 p-2 rounded-full">
                                                    <CalendarIcon className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-blue-300 font-medium">
                                                        {leaveDuration} day{leaveDuration !== 1 ? 's' : ''} of leave requested
                                                    </p>
                                                    <p className="text-sm text-blue-200/70">
                                                        From {format(form.getValues('startDate'), "MMM d")} to {format(form.getValues('endDate'), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="reason"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base text-gray-200">Reason</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Please provide details about your leave request"
                                                            className="resize-none min-h-[140px] text-base bg-[#2d3748] border-gray-700 text-white focus:border-blue-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-sm pt-2 text-gray-400">
                                                        Your reason will be reviewed by management
                                                    </FormDescription>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex justify-end gap-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.reset();
                                                    setShowStartCalendar(false);
                                                    setShowEndCalendar(false);
                                                }}
                                                className="h-12 px-7 text-base bg-transparent border border-gray-600 text-gray-200 rounded-md hover:bg-gray-700 hover:text-white"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="h-12 px-9 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                        <span>Submitting</span>
                                                    </>
                                                ) : (
                                                    "Submit"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Leaves;