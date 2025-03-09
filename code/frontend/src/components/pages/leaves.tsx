import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, LoaderCircle } from 'lucide-react';
import Layout from "@/components/layout";

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
    return !data.startDate || !data.endDate || data.endDate >= data.startDate;
}, {
    message: "End date cannot be before start date",
    path: ["endDate"],
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
        <Layout>
            <div className="flex-1  flex items-center  p-4">
                <div className='w-[66vw] h-[88vh] flex ' style={{
                    paddingLeft: '34vh',
                    paddingRight: '0vh',
                }}>
                    <Card className="w-full shadow-lg bg-[#1e293b] border-0 text-white">
                        <CardHeader className="pb-6 pt-8 border-b border-gray-700">
                            <CardTitle className="text-2xl font-medium text-center text-white">
                                Leave Application Form
                            </CardTitle>
                            <CardDescription className="text-center text-base text-gray-300">
                                Submit your leave request for approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 py-10">
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
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-base text-gray-200">Start Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className="h-12 w-full justify-start text-left font-normal text-base bg-[#2d3748] border-gray-700 text-white hover:bg-[#3b4758] hover:text-white"
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "PPP")
                                                                        ) : (
                                                                            <span>Pick a date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-[#2d3748] border-gray-700 text-white" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) => {
                                                                        const today = new Date();
                                                                        today.setHours(0, 0, 0, 0);
                                                                        return date < today;
                                                                    }}
                                                                    initialFocus
                                                                    className="p-2 bg-[#2d3748] text-white"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-base text-gray-200">End Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className="h-12 w-full justify-start text-left font-normal text-base bg-[#2d3748] border-gray-700 text-white hover:bg-[#3b4758] hover:text-white"
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "PPP")
                                                                        ) : (
                                                                            <span>Pick a date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-[#2d3748] border-gray-700 text-white" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) => {
                                                                        const startDate = form.getValues("startDate");
                                                                        if (!startDate) return true;
                                                                        return date < startDate;
                                                                    }}
                                                                    initialFocus
                                                                    className="p-2 bg-[#2d3748] text-white"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

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
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => form.reset()}
                                                className="h-12 px-7 text-base bg-transparent border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="h-12 px-9 text-base bg-blue-600 hover:bg-blue-700 text-white"
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
            </div>
        </Layout>
    );
};

export default Leaves;