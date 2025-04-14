import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, LoaderCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import Layout from "@/components/layout";
import { DatePicker } from "@/components/date-picker"; 

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for leave balance
interface LeaveBalance {
    sick: number;
    casual: number;
    earned: number;
}

interface FullLeaveBalance {
    allocated: LeaveBalance;
    used: LeaveBalance;
    remaining: LeaveBalance;
    monthsSinceRegistration: number;
}

// Leave allocation per month
const LEAVES_PER_MONTH = {
    sick: 12,
    casual: 12, 
    earned: 12
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [leaveDuration, setLeaveDuration] = useState<number | null>(null);
    const [leaveBalance, setLeaveBalance] = useState<FullLeaveBalance | null>(null);
    
    // For error dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<{leaveType: string, duration: number, shortfall: number}>({
        leaveType: '',
        duration: 0,
        shortfall: 0
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    });

    // Fetch leave balance
    useEffect(() => {
        async function fetchLeaveBalance() {
            try {
                const response = await fetch('http://localhost:5000/api/leaves/balance', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch leave balance');
                }

                const data: FullLeaveBalance = await response.json();
                setLeaveBalance(data);
            } catch (error) {
                console.error("Error fetching leave balance:", error);
            }
        }

        fetchLeaveBalance();
    }, [submitted]);

    // Leave balance check before submission
    const validateLeaveBalance = (): boolean => {
        if (!leaveBalance || !leaveDuration) return true;
        
        const leaveType = form.getValues("leaveType") as keyof LeaveBalance;
        if (!leaveType) return true;
        
        return leaveBalance.remaining[leaveType] >= leaveDuration;
    };

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

   // Updated onSubmit function with improved error handling
async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        // Check if user has enough leave balance
        const leaveType = values.leaveType as keyof LeaveBalance;
        
        if (!validateLeaveBalance()) {
            // Calculate shortfall
            const shortfall = Math.abs(leaveDuration! - leaveBalance!.remaining[leaveType]);
            
            // Set error message data for the dialog
            setErrorMessage({
                leaveType: leaveType,
                duration: leaveDuration!,
                shortfall: shortfall
            });
            
            // Open error dialog instead of alert
            setErrorDialogOpen(true);
            setIsSubmitting(false);
            return;
        }
        
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
                leaveType: "",
                startDate: undefined,
                endDate: undefined,
                reason: "",
            });
            setLeaveDuration(null);
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
            <div className={`py-5 px-120 flex justify-center`}>
                <div className={`w-full max-w-5xl`}>
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
    {/* Leave Balance Section */}
    {!submitted && leaveBalance && (
        <div className="mb-8">
            <h3 className="text-xl font-medium mb-4 text-white">Your Leave Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#273344] border border-[#344056] rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-300">Sick Leave</h4>
                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                            leaveBalance.remaining.sick > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {leaveBalance.remaining.sick} day{leaveBalance.remaining.sick !== 1 ? 's' : ''} left
                        </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                        <div className="flex justify-between mt-1">
                            <span>Total allocated:</span>
                            <span>{leaveBalance.allocated.sick} days</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Used:</span>
                            <span>{leaveBalance.used.sick} days</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#273344] border border-[#344056] rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-300">Casual Leave</h4>
                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                            leaveBalance.remaining.casual > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {leaveBalance.remaining.casual} day{leaveBalance.remaining.casual !== 1 ? 's' : ''} left
                        </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                        <div className="flex justify-between mt-1">
                            <span>Total allocated:</span>
                            <span>{leaveBalance.allocated.casual} days</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Used:</span>
                            <span>{leaveBalance.used.casual} days</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#273344] border border-[#344056] rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-300">Earned Leave</h4>
                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                            leaveBalance.remaining.earned > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {leaveBalance.remaining.earned} day{leaveBalance.remaining.earned !== 1 ? 's' : ''} left
                        </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                        <div className="flex justify-between mt-1">
                            <span>Total allocated:</span>
                            <span>{leaveBalance.allocated.earned} days</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Used:</span>
                            <span>{leaveBalance.used.earned} days</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-3 text-sm text-gray-400 flex items-center">
                <Info size={16} className="mr-1" /> 
                <span>Leaves are allocated at the rate of {LEAVES_PER_MONTH.sick} per month for each type since your registration date.</span>
            </div>
        </div>
    )}

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
                                                    <Select onValueChange={(value) => {
                                                        field.onChange(value);
                                                        // This will trigger a re-render to show the selected leave type's remaining balance
                                                    }} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 text-base bg-[#2d3748] border-gray-700 text-white">
                                                                <SelectValue placeholder="Select leave type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#2d3748] border-gray-700 text-white">
                                                            <SelectItem value="sick" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Sick Leave {leaveBalance && <span className="text-sm ml-2">({leaveBalance.remaining.sick} left)</span>}
                                                            </SelectItem>
                                                            <SelectItem value="casual" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Casual Leave {leaveBalance && <span className="text-sm ml-2">({leaveBalance.remaining.casual} left)</span>}
                                                            </SelectItem>
                                                            <SelectItem value="earned" className="text-base py-3 focus:bg-[#3b4758] focus:text-white">
                                                                Earned Leave {leaveBalance && <span className="text-sm ml-2">({leaveBalance.remaining.earned} left)</span>}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-400" />
                                                    {field.value && leaveBalance && (
                                                        <div className="mt-2 text-sm">
                                                            <span className={`font-medium ${leaveBalance.remaining[field.value as keyof LeaveBalance] > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {leaveBalance.remaining[field.value as keyof LeaveBalance]} days remaining
                                                            </span> of {leaveBalance.allocated[field.value as keyof LeaveBalance]} allocated
                                                        </div>
                                                    )}
                                                    {field.value && leaveBalance && leaveDuration && (
                                                        <div className="mt-2 p-2 rounded-md border bg-opacity-20 text-sm" 
                                                             style={{
                                                                 borderColor: leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? '#4ade80' : '#f87171',
                                                                 backgroundColor: leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                                                             }}>
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center">
                                                                    {leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? 
                                                                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-1" /> : 
                                                                        <AlertCircle className="h-4 w-4 text-red-400 mr-1" />
                                                                    }
                                                                    <span className={leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? 'text-green-400' : 'text-red-400'}>
                                                                        {leaveDuration} day{leaveDuration !== 1 ? 's' : ''} requested
                                                                    </span>
                                                                </span>
                                                                <span className={`font-medium ${leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {leaveBalance.remaining[field.value as keyof LeaveBalance] - leaveDuration >= 0 ? 
                                                                        `${leaveBalance.remaining[field.value as keyof LeaveBalance] - leaveDuration} days will remain` : 
                                                                        `Insufficient balance (${Math.abs(leaveBalance.remaining[field.value as keyof LeaveBalance] - leaveDuration)} days short)`
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                    <FormControl>
                                                        <DatePicker 
                                                            date={field.value} 
                                                            setDate={(date) => {
                                                                field.onChange(date);
                                                                // Reset end date if it's before new start date
                                                                const endDate = form.getValues("endDate");
                                                                if (endDate && date > endDate) {
                                                                    // Use a new Date instance that's far in the future, then clear it via form.reset later
                                                                    form.setValue("endDate", new Date());
                                                                    // Then use setTimeout to clear both dates properly
                                                                    setTimeout(() => {
                                                                        form.setValue("endDate", undefined as any);
                                                                    }, 0);
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
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
                                                    <FormControl>
                                                        <DatePicker 
                                                            date={field.value}
                                                            setDate={(date) => field.onChange(date)}
                                                            minDate={form.getValues("startDate")}
                                                        />
                                                    </FormControl>
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

            {/* Error Dialog for Insufficient Leave Balance */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#1e293b] border-0 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <XCircle className="h-6 w-6 text-red-500" />
                            Insufficient Leave Balance
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                            You don't have enough leave balance for this request.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4">
                            <h4 className="text-red-300 font-medium flex items-center mb-2">
                                <AlertCircle className="h-5 w-5 mr-2" /> Leave Balance Issue
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-300">
                                    <span>Leave type:</span>
                                    <span className="font-medium text-white capitalize">{errorMessage.leaveType} Leave</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Requested duration:</span>
                                    <span className="font-medium text-white">{errorMessage.duration} days</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Available balance:</span>
                                    <span className="font-medium text-white">
                                        {leaveBalance && errorMessage.leaveType && 
                                         leaveBalance.remaining[errorMessage.leaveType as keyof LeaveBalance]} days
                                    </span>
                                </div>
                                <div className="flex justify-between text-red-300 font-medium">
                                    <span>Shortfall:</span>
                                    <span>{errorMessage.shortfall} days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-gray-300 text-sm">
                            Please consider one of the following options:
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Reduce the duration of your leave request</li>
                                <li>Choose a different leave type with sufficient balance</li>
                                <li>Split your leave across multiple leave types</li>
                            </ul>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => setErrorDialogOpen(false)}
                        >
                            I Understand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Leaves;
