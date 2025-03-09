import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    // Ensure end date is not before start date
    return !data.startDate || !data.endDate || data.endDate >= data.startDate;
}, {
    message: "End date cannot be before start date",
    path: ["endDate"], // This specifies which field the error belongs to
});

const Leaves: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        try {
            // Format dates for API submission
            const formattedData = {
                ...values,
                startDate: format(values.startDate, "yyyy-MM-dd"),
                endDate: format(values.endDate, "yyyy-MM-dd"),
                status: "pending", // Initial status
                submittedAt: new Date().toISOString(),
            };

            console.log("Submitting leave data:", formattedData);

            // Send data to backend API
            const response = await fetch('http://localhost:5000/api/leaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if you have one
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit leave request');
            }

            const responseData = await response.json();
            console.log("Leave submission successful:", responseData);

            // Show success message
            setSubmitted(true);
            setTimeout(() => {
                form.reset();
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
        <div className="container mx-auto pt-24 pb-16 p-4 max-w-5xl">
            <Card className="shadow-md mt-8">
                <CardHeader className="pb-8 pt-10">
                    <CardTitle className="text-2xl font-medium text-center">Leave Application Form</CardTitle>
                    <CardDescription className="text-center text-base">
                        Submit your leave request for approval
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-12">
                    {submitted ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
                            <h3 className="text-xl font-medium mb-2">Application Submitted Successfully</h3>
                            <p className="text-muted-foreground text-lg">
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
                                            <FormLabel className="text-base">Leave Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select leave type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="sick" className="text-base py-3">Sick Leave</SelectItem>
                                                    <SelectItem value="casual" className="text-base py-3">Casual Leave</SelectItem>
                                                    <SelectItem value="earned" className="text-base py-3">Earned Leave</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-base">Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className="h-12 w-full justify-start text-left font-normal text-base"
                                                            >
                                                                {field.value instanceof Date ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                // If end date is before new start date, reset it
                                                                const currentEndDate = form.getValues("endDate");
                                                                if (currentEndDate && date && date > currentEndDate) {
                                                                    form.setValue("endDate", null);
                                                                }
                                                            }}
                                                            disabled={(date) => {
                                                                // Disable dates before today
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                return date < today;
                                                            }}
                                                            initialFocus
                                                            className="p-2"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-base">End Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className="h-12 w-full justify-start text-left font-normal text-base"
                                                            >
                                                                {field.value instanceof Date ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                // Get start date from form
                                                                const startDate = form.getValues("startDate");
                                                                // If no start date, disable all dates
                                                                if (!startDate) return true;

                                                                // Format both dates to compare them by day only (ignoring time)
                                                                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

                                                                // Allow selecting the same day or later
                                                                return dateOnly < startDateOnly;
                                                            }}
                                                            initialFocus
                                                            className="p-2"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Reason</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Please provide details about your leave request"
                                                    className="resize-none min-h-[140px] text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-sm pt-2">
                                                Your reason will be reviewed by management
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => form.reset()}
                                        className="h-12 px-7 text-base"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-9 text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                <span>Submitting</span>
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Leaves;