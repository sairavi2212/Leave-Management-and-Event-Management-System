import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, formatRelative, startOfDay, subDays } from 'date-fns';
import { CalendarIcon, CheckCircle2, LoaderCircle, AlertCircle, Info, XCircle, Check, Clock, RefreshCcw, Filter, Eye, Bell, X, InboxIcon, BadgeCheck, AlertOctagon } from 'lucide-react';
import { toast, Toaster } from "sonner";
import { DatePicker } from "@/components/date-picker"; 
import { ThemeProvider } from "@/components/theme-provider";
import {
    SidebarProvider,
} from "@/components/ui/sidebar";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import CustomHeader from '../CustomHeader';
import CustomSidebar from '../CustomSidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

// Interface for leave history
interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  comments?: string;
  approvedAt?: string;
}

// Interface for leave notifications
interface LeaveNotification {
  _id: string;
  leaveType: string;
  status: 'approved' | 'rejected';
  approvedAt: string;
  read: boolean;
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

// Notification component to display recent approvals/rejections
const LeaveNotifications = ({ notifications, onClose, onMarkAsRead }: { 
  notifications: LeaveNotification[], 
  onClose: () => void,
  onMarkAsRead: (ids: string[]) => void
}) => {
    const stopPropagation = (e: React.MouseEvent) => {
        // Prevent clicks inside the card from closing the dropdown
        e.stopPropagation();
    };

    // Group notifications by date (today, yesterday, older)
    const groupedNotifications = useMemo(() => {
        const today = startOfDay(new Date()).getTime();
        const yesterday = startOfDay(subDays(new Date(), 1)).getTime();
        
        const groups: {[key: string]: LeaveNotification[]} = {
            today: [],
            yesterday: [],
            older: []
        };
        
        notifications.forEach(notification => {
            const notifDate = startOfDay(new Date(notification.approvedAt)).getTime();
            
            if (notifDate === today) {
                groups.today.push(notification);
            } else if (notifDate === yesterday) {
                groups.yesterday.push(notification);
            } else {
                groups.older.push(notification);
            }
        });
        
        return groups;
    }, [notifications]);
    
    // Get unread notifications
    const unreadNotifications = useMemo(() => 
        notifications.filter(n => !n.read), 
    [notifications]);

    return (
        <Card className="shadow-lg w-80 max-h-[500px] overflow-hidden" onClick={stopPropagation}>
            <CardHeader className="pb-2 pt-3 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                        {unreadNotifications.length > 0 && (
                            <Badge className="ml-2 bg-red-500 hover:bg-red-600 text-xs">
                                {unreadNotifications.length} new
                            </Badge>
                        )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="rounded-full bg-muted p-3 mb-3">
                        <InboxIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        No notifications yet. You'll see updates about your leave requests here.
                    </p>
                </div>
            ) : (
                <>
                    <ScrollArea className="max-h-[350px]">
                        <div className="px-4 py-2">
                            {/* Today's notifications */}
                            {groupedNotifications.today.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
                                        Today
                                    </div>
                                    <div className="space-y-2">
                                        {groupedNotifications.today.map(notification => (
                                            <NotificationItem key={notification._id} notification={notification} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Yesterday's notifications */}
                            {groupedNotifications.yesterday.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
                                        Yesterday
                                    </div>
                                    <div className="space-y-2">
                                        {groupedNotifications.yesterday.map(notification => (
                                            <NotificationItem key={notification._id} notification={notification} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Older notifications */}
                            {groupedNotifications.older.length > 0 && (
                                <div className="mb-2">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-1">
                                        Earlier
                                    </div>
                                    <div className="space-y-2">
                                        {groupedNotifications.older.map(notification => (
                                            <NotificationItem key={notification._id} notification={notification} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    
                    <CardFooter className="flex justify-between py-2 px-4 border-t">
                        {unreadNotifications.length > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs mr-2 flex-1"
                                onClick={() => onMarkAsRead(unreadNotifications.map(n => n._id))}
                            >
                                <Check className="h-3 w-3 mr-1" /> Mark all as read
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs flex-1" onClick={onClose}>
                            Close
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
};

// Individual notification item component
const NotificationItem = ({ notification }: { notification: LeaveNotification }) => {
    const isApproved = notification.status === 'approved';
    
    return (
        <div className={`p-3 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/20'} text-sm relative transition-all duration-200`}>
            {!notification.read && (
                <div className="absolute right-2 top-2 h-2 w-2 bg-blue-500 rounded-full" />
            )}
            <div className="flex items-center gap-2 mb-1.5">
                <div className="rounded-full p-1">
                    {isApproved ? (
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertOctagon className="h-4 w-4 text-red-500" />
                    )}
                </div>
                <div className="flex-1 font-medium">
                    {isApproved ? 'Leave Approved' : 'Leave Rejected'}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelative(new Date(notification.approvedAt), new Date())}
                </span>
            </div>
            <p className="ml-6">
                Your <span className="capitalize font-medium">{notification.leaveType}</span> leave has been <span className={`font-medium ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{notification.status}</span>.
            </p>
        </div>
    );
};

const Leaves: React.FC = () => {
    // States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [leaveDuration, setLeaveDuration] = useState<number | null>(null);
    const [leaveBalance, setLeaveBalance] = useState<FullLeaveBalance | null>(null);
    const [activeTab, setActiveTab] = useState('apply');
    
    // For error dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<{leaveType: string, duration: number, shortfall: number}>({
        leaveType: '',
        duration: 0,
        shortfall: 0
    });
    
    // For leave history
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [leaveToDelete, setLeaveToDelete] = useState<string | null>(null);
    
    // For notifications
    const [notifications, setNotifications] = useState<LeaveNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    });

    // Mark notifications as read in the backend
    const markNotificationsAsRead = async (notificationIds: string[]) => {
        if (notificationIds.length === 0) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/leaves/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ notificationIds })
            });
            
            if (response.ok) {
                // Update local state to mark notifications as read
                setNotifications(prevNotifications => 
                    prevNotifications.filter(notification => !notificationIds.includes(notification._id))
                );
                
                // Update notification count
                setNotificationCount(prev => Math.max(0, prev - notificationIds.length));
                
                // If we've marked all notifications as read, remove the indicator
                if (notificationCount - notificationIds.length <= 0) {
                    setHasNewNotifications(false);
                }
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

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

    // Fetch leave history
    useEffect(() => {
        if (activeTab === 'history') {
            fetchLeaves();
        }
    }, [activeTab, submitted]);
    
    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/leaves/notifications', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                    setNotificationCount(data.length);
                    
                    // Check if there are new notifications
                    if (data.length > 0) {
                        const lastCheckedTime = localStorage.getItem('lastNotificationCheck');
                        const mostRecentNotification = new Date(data[0].approvedAt).getTime();
                        
                        if (!lastCheckedTime || mostRecentNotification > parseInt(lastCheckedTime)) {
                            setHasNewNotifications(true);
                        }
                        
                        // If notifications are shown automatically, mark as seen
                        if (data.length > 0 && !lastCheckedTime) {
                            setShowNotifications(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        
        fetchNotifications();
        
        // Set up interval to check for new notifications every 10 seconds (was 60 seconds before)
        const intervalId = setInterval(fetchNotifications, 10000);
        return () => clearInterval(intervalId);
    }, []);
    
    // Mark notifications as read when viewed
    const handleNotificationsViewed = () => {
        localStorage.setItem('lastNotificationCheck', Date.now().toString());
        setHasNewNotifications(false);
    };

    const fetchLeaves = async () => {
        setLoadingHistory(true);
        setHistoryError(null);
        try {
            const response = await fetch('http://localhost:5000/api/leaves', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch leave requests');
            }

            const data = await response.json();
            setLeaves(data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setHistoryError(error instanceof Error ? error.message : 'Failed to fetch leave requests');
        } finally {
            setLoadingHistory(false);
        }
    };

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

    // Functions for leave history tab
    const deleteLeave = async (leaveId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/leaves/${leaveId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete leave request');
            }

            // Remove the deleted leave from the state
            setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave._id !== leaveId));

            // Show success toast
            toast.success("Leave Request Deleted", {
                description: "Your leave request has been deleted successfully.",
                duration: 3000,
            });

            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error('Error deleting leave request:', error);
            setHistoryError(error instanceof Error ? error.message : 'Failed to delete leave request');

            // Show error toast
            toast.error("Error", {
                description: error instanceof Error ? error.message : 'Failed to delete leave request',
                duration: 5000,
            });
        }
    };

    const confirmDelete = (leaveId: string) => {
        setLeaveToDelete(leaveId);
        setDeleteConfirmOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500 hover:bg-green-600"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const getLeaveTypeName = (type: string) => {
        switch (type) {
            case 'sick':
                return 'Sick Leave';
            case 'casual':
                return 'Casual Leave';
            case 'earned':
                return 'Earned Leave';
            case 'unpaid':
                return 'Unpaid Leave';
            default:
                return type;
        }
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    };

    const filteredLeaves = statusFilter === 'all'
        ? leaves
        : leaves.filter(leave => leave.status === statusFilter);

    const showDetails = (leave: Leave) => {
        setSelectedLeave(leave);
        setDetailsOpen(true);
    };

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
                reason: values.reason,
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
            
            // Show success toast
            toast.success("Leave Request Submitted", {
                description: "Your leave request has been submitted successfully.",
                duration: 3000,
            });
            
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
            toast.error("Error", {
                description: error instanceof Error ? error.message : 'Failed to submit leave request',
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Calculate leave balance percentage
    const calculateBalancePercentage = (used: number, allocated: number) => {
        const usedPercentage = ((used) / allocated) * 100;
        return parseFloat(Math.min(100, Math.max(0, usedPercentage)).toFixed(2));
    };

    return (
        <ThemeProvider>
            <SidebarProvider>
                <div className="flex h-screen w-full overflow-hidden">
                    {/* Sidebar */}
                    <CustomSidebar />

                    {/* Main Content Area */}
                    <div className="flex flex-col flex-1 w-full overflow-hidden">
                        {/* Header with sidebar trigger and theme toggle */}
                        <CustomHeader title='Leave Management'/>
                        {/* Main Content with Scrolling */}
                        <main className="flex-1 w-full overflow-y-auto">
                            <div className="flex justify-center w-full py-6">
                                <div className="w-full max-w-5xl px-4">
                                    {/* Notifications bell icon */}
                                    <div className="flex justify-end mb-2">
                                        <div className="relative">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="rounded-full p-2"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent click from propagating
                                                    setShowNotifications(true); // Always show notifications when clicked
                                                    handleNotificationsViewed();
                                                }}
                                            >
                                                <Bell className="h-5 w-5" />
                                                {hasNewNotifications && notificationCount > 0 && (
                                                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                                        {notificationCount > 9 ? '9+' : notificationCount}
                                                    </span>
                                                )}
                                            </Button>
                                            
                                            {/* Notifications dropdown */}
                                            {showNotifications && (
                                                <div className="absolute right-0 z-50 mt-1">
                                                    <LeaveNotifications 
                                                        notifications={notifications} 
                                                        onClose={() => setShowNotifications(false)} 
                                                        onMarkAsRead={markNotificationsAsRead}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <Tabs defaultValue="apply" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                                        <div className="mb-8">
                                            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto">
                                                <TabsTrigger value="apply" className="text-sm sm:text-base py-2 px-2 sm:py-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow">Apply for Leave</TabsTrigger>
                                                <TabsTrigger value="balance" className="text-sm sm:text-base py-2 px-2 sm:py-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow">Leave Balance</TabsTrigger>
                                                <TabsTrigger value="history" className="text-sm sm:text-base py-2 px-2 sm:py-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow">History</TabsTrigger>
                                            </TabsList>
                                        </div>
                                        
                                        {/* Apply for Leave Tab */}
                                        <TabsContent value="apply" className="mt-4">
                                            <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                                                <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                                                    <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                                                        <CalendarIcon className="h-6 w-6 mr-2" />
                                                        <span>Leave Application</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-base opacity-90">
                                                        Request time off work for personal or professional reasons
                                                    </CardDescription>
                                                </CardHeader>
                                                
                                                <CardContent className="p-0">
                                                    {submitted ? (
                                                        <div className="flex flex-col items-center py-16 text-center px-6">
                                                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30 mb-6">
                                                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                                                            </div>
                                                            <h3 className="text-2xl font-semibold mb-3">
                                                                Application Submitted Successfully
                                                            </h3>
                                                            <p className="text-lg opacity-80 max-w-md">
                                                                Your request has been sent for approval. You will be notified once it is reviewed.
                                                            </p>
                                                            <Button 
                                                                className="mt-8" 
                                                                variant="outline" 
                                                                onClick={() => setActiveTab('history')}
                                                            >
                                                                View Leave History
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 md:p-8">
                                                            {/* Leave Balance Summary */}
                                                            {leaveBalance && (
                                                                <div className="mb-8 p-4 rounded-xl bg-muted/30">
                                                                    <h3 className="text-lg font-medium mb-3 flex items-center">
                                                                        <Info size={18} className="mr-2 text-blue-500" /> 
                                                                        Available Leave Balance
                                                                    </h3>
                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        {Object.entries(leaveBalance.remaining).map(([type, value]) => (
                                                                            <div 
                                                                                key={type}
                                                                                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                                                                                    value > 0 
                                                                                        ? 'bg-green-500/10 border border-green-500/20' 
                                                                                        : 'bg-red-500/10 border border-red-500/20'
                                                                                }`}
                                                                            >
                                                                                <span className="text-sm capitalize opacity-80">{type}</span>
                                                                                <span className={`text-xl font-bold mt-1 ${
                                                                                    value > 0 ? 'text-green-500' : 'text-red-500'
                                                                                }`}>
                                                                                    {value}
                                                                                </span>
                                                                                <span className="text-xs mt-1">days remaining</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Application Form */}
                                                            <Form {...form}>
                                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="leaveType"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-base">Leave Type</FormLabel>
                                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger className="h-11 text-base">
                                                                                            <SelectValue placeholder="Select leave type" />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="sick" className="text-base py-2.5">
                                                                                            Sick Leave {leaveBalance && (
                                                                                                <Badge variant={leaveBalance.remaining.sick > 0 ? "outline" : "destructive"} className="ml-2">
                                                                                                    {leaveBalance.remaining.sick} remaining
                                                                                                </Badge>
                                                                                            )}
                                                                                        </SelectItem>
                                                                                        <SelectItem value="casual" className="text-base py-2.5">
                                                                                            Casual Leave {leaveBalance && (
                                                                                                <Badge variant={leaveBalance.remaining.casual > 0 ? "outline" : "destructive"} className="ml-2">
                                                                                                    {leaveBalance.remaining.casual} remaining
                                                                                                </Badge>
                                                                                            )}
                                                                                        </SelectItem>
                                                                                        <SelectItem value="earned" className="text-base py-2.5">
                                                                                            Earned Leave {leaveBalance && (
                                                                                                <Badge variant={leaveBalance.remaining.earned > 0 ? "outline" : "destructive"} className="ml-2">
                                                                                                    {leaveBalance.remaining.earned} remaining
                                                                                                </Badge>
                                                                                            )}
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                
                                                                                {/* Leave Balance Visualization */}
                                                                                {field.value && leaveBalance && leaveDuration && (
                                                                                    <div className="mt-3 p-3 rounded-lg bg-muted/30 border">
                                                                                        <div className="flex justify-between items-center mb-2">
                                                                                            <div className="flex items-center">
                                                                                                {leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? (
                                                                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                                                                                ) : (
                                                                                                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                                                                                )}
                                                                                                <span className="font-medium">
                                                                                                    {leaveDuration} day{leaveDuration !== 1 ? 's' : ''} requested
                                                                                                </span>
                                                                                            </div>
                                                                                            <Badge variant={leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? "outline" : "destructive"}>
                                                                                                {leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? (
                                                                                                    `${leaveBalance.remaining[field.value as keyof LeaveBalance] - leaveDuration} will remain`
                                                                                                ) : (
                                                                                                    `${Math.abs(leaveBalance.remaining[field.value as keyof LeaveBalance] - leaveDuration)} short`
                                                                                                )}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                                                                            <div 
                                                                                                className={`h-full ${leaveBalance.remaining[field.value as keyof LeaveBalance] >= leaveDuration ? 'bg-green-500' : 'bg-red-500'}`}
                                                                                                style={{width: `${Math.min(100, (leaveDuration / leaveBalance.allocated[field.value as keyof LeaveBalance]) * 100)}%`}}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex justify-between mt-1 text-xs opacity-70">
                                                                                            <span>0</span>
                                                                                            <span>Total: {leaveBalance.allocated[field.value as keyof LeaveBalance]} days</span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="startDate"
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-base">Start Date</FormLabel>
                                                                                    <FormControl>
                                                                                        <DatePicker 
                                                                                            date={field.value}
                                                                                            setDate={(date) => {
                                                                                                field.onChange(date);
                                                                                                const endDate = form.getValues("endDate");
                                                                                                if (endDate && date && date > endDate) {
                                                                                                    form.setValue("endDate", new Date());
                                                                                                    setTimeout(() => {
                                                                                                        form.setValue("endDate", undefined as any);
                                                                                                    }, 0);
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="endDate"
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-base">End Date</FormLabel>
                                                                                    <FormControl>
                                                                                        <DatePicker 
                                                                                            date={field.value}
                                                                                            setDate={(date) => field.onChange(date)}
                                                                                            disabledDates={(date) => form.getValues("startDate") && date < form.getValues("startDate")}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    {/* Leave Duration Summary */}
                                                                    {leaveDuration && (
                                                                        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
                                                                            <div className="flex items-center">
                                                                                <div className="p-2 rounded-full bg-blue-500/20 mr-3">
                                                                                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium">
                                                                                        {leaveDuration} day{leaveDuration !== 1 ? 's' : ''} of leave
                                                                                    </p>
                                                                                    <p className="text-sm opacity-80">
                                                                                        {format(form.getValues('startDate'), "MMM d")} - {format(form.getValues('endDate'), "MMM d, yyyy")}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <Badge variant="secondary" className="text-sm px-3">
                                                                                {leaveDuration} {leaveDuration === 1 ? 'day' : 'days'}
                                                                            </Badge>
                                                                        </div>
                                                                    )}

                                                                    <FormField
                                                                        control={form.control}
                                                                        name="reason"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-base">Reason for Leave</FormLabel>
                                                                                <FormControl>
                                                                                    <Textarea
                                                                                        placeholder="Please provide details about your leave request"
                                                                                        className="resize-none min-h-[120px] text-base"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormDescription>
                                                                                    Your reason will be reviewed by management
                                                                                </FormDescription>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                form.reset({
                                                                                    leaveType: "",
                                                                                    startDate: undefined,
                                                                                    endDate: undefined,
                                                                                    reason: "",
                                                                                });
                                                                                setLeaveDuration(null);
                                                                            }}
                                                                            className="order-2 sm:order-1"
                                                                        >
                                                                            Reset Form
                                                                        </Button>
                                                                        <Button
                                                                            type="submit"
                                                                            disabled={isSubmitting}
                                                                            className="w-full sm:w-auto order-1 sm:order-2"
                                                                            size="lg"
                                                                        >
                                                                            {isSubmitting ? (
                                                                                <>
                                                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                                                    <span>Processing...</span>
                                                                                </>
                                                                            ) : (
                                                                                "Submit Application"
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            </Form>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                        {/* Leave Balance Tab */}
                                        <TabsContent value="balance">
                                            <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                                                <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                                                    <CardTitle className="text-2xl font-semibold">Leave Balance Details</CardTitle>
                                                    <CardDescription className="text-base opacity-90">
                                                        Detailed breakdown of your leave allocations and usage
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-6 md:p-8">
                                                    {leaveBalance ? (
                                                        <div className="space-y-8">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {/* Sick Leave */}
                                                                <Card className="overflow-hidden">
                                                                    <CardHeader className="py-4 bg-blue-500/10">
                                                                        <div className="flex justify-between items-center">
                                                                            <CardTitle className="text-xl">Sick Leave</CardTitle>
                                                                            <Badge variant={leaveBalance.remaining.sick > 0 ? "outline" : "destructive"}>
                                                                                {leaveBalance.remaining.sick} remaining
                                                                            </Badge>
                                                                        </div>
                                                                    </CardHeader>
                                                                    <CardContent className="p-4">
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm">Used: {leaveBalance.used.sick} days</span>
                                                                                    <span className="text-sm">{calculateBalancePercentage(leaveBalance.used.sick, leaveBalance.allocated.sick)}%</span>
                                                                                </div>
                                                                                <div className="w-full h-2 bg-muted rounded-full">
                                                                                    <div 
                                                                                        className="h-full bg-blue-500 rounded-full"
                                                                                        style={{
                                                                                            width: `${calculateBalancePercentage(leaveBalance.used.sick, leaveBalance.allocated.sick)}%`
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <div>Allocated: <span className="font-medium">{leaveBalance.allocated.sick} days</span></div>
                                                                                <div>Remaining: <span className="font-medium">{leaveBalance.remaining.sick} days</span></div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                                
                                                                {/* Casual Leave */}
                                                                <Card className="overflow-hidden">
                                                                    <CardHeader className="py-4 bg-green-500/10">
                                                                        <div className="flex justify-between items-center">
                                                                            <CardTitle className="text-xl">Casual Leave</CardTitle>
                                                                            <Badge variant={leaveBalance.remaining.casual > 0 ? "outline" : "destructive"}>
                                                                                {leaveBalance.remaining.casual} remaining
                                                                            </Badge>
                                                                        </div>
                                                                    </CardHeader>
                                                                    <CardContent className="p-4">
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm">Used: {leaveBalance.used.casual} days</span>
                                                                                    <span className="text-sm">{calculateBalancePercentage(leaveBalance.used.casual, leaveBalance.allocated.casual)}%</span>
                                                                                </div>
                                                                                <div className="w-full h-2 bg-muted rounded-full">
                                                                                    <div 
                                                                                        className="h-full bg-green-500 rounded-full"
                                                                                        style={{
                                                                                            width: `${calculateBalancePercentage(leaveBalance.used.casual, leaveBalance.allocated.casual)}%`
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <div>Allocated: <span className="font-medium">{leaveBalance.allocated.casual} days</span></div>
                                                                                <div>Remaining: <span className="font-medium">{leaveBalance.remaining.casual} days</span></div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                                
                                                                {/* Earned Leave */}
                                                                <Card className="overflow-hidden">
                                                                    <CardHeader className="py-4 bg-purple-500/10">
                                                                        <div className="flex justify-between items-center">
                                                                            <CardTitle className="text-xl">Earned Leave</CardTitle>
                                                                            <Badge variant={leaveBalance.remaining.earned > 0 ? "outline" : "destructive"}>
                                                                                {leaveBalance.remaining.earned} remaining
                                                                            </Badge>
                                                                        </div>
                                                                    </CardHeader>
                                                                    <CardContent className="p-4">
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm">Used: {leaveBalance.used.earned} days</span>
                                                                                    <span className="text-sm">{calculateBalancePercentage(leaveBalance.used.earned, leaveBalance.allocated.earned)}%</span>
                                                                                </div>
                                                                                <div className="w-full h-2 bg-muted rounded-full">
                                                                                    <div 
                                                                                        className="h-full bg-purple-500 rounded-full"
                                                                                        style={{
                                                                                            width: `${calculateBalancePercentage(leaveBalance.used.earned, leaveBalance.allocated.earned)}%`
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <div>Allocated: <span className="font-medium">{leaveBalance.allocated.earned} days</span></div>
                                                                                <div>Remaining: <span className="font-medium">{leaveBalance.remaining.earned} days</span></div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                            
                                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                                <h3 className="text-lg font-medium mb-2 flex items-center">
                                                                    <Info size={18} className="mr-2" />Leave Policy Information
                                                                </h3>
                                                                <ul className="space-y-2 text-sm">
                                                                    <li className="flex gap-2">
                                                                        <span className="opacity-70">•</span>
                                                                        <span>Each type of leave is allocated at {LEAVES_PER_MONTH.sick} days per month since your registration date.</span>
                                                                    </li>
                                                                    <li className="flex gap-2">
                                                                        <span className="opacity-70">•</span>
                                                                        <span>You have been registered for {leaveBalance.monthsSinceRegistration} months.</span>
                                                                    </li>
                                                                    <li className="flex gap-2">
                                                                        <span className="opacity-70">•</span>
                                                                        <span>Leave allocations are calculated on a pro-rata basis.</span>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-64">
                                                            <LoaderCircle className="h-8 w-8 animate-spin opacity-70" />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                        {/* History Tab - Implemented from myleaves.tsx */}
                                        <TabsContent value="history">
                                            <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                                                <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <CardTitle className="text-2xl font-semibold">Leave History</CardTitle>
                                                            <CardDescription className="text-base opacity-90">
                                                                Track all your previous leave applications
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <div className="flex items-center">
                                                                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                                    <SelectTrigger className="w-32 h-10">
                                                                        <SelectValue placeholder="Filter" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">All Leaves</SelectItem>
                                                                        <SelectItem value="pending">Pending</SelectItem>
                                                                        <SelectItem value="approved">Approved</SelectItem>
                                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button onClick={fetchLeaves} variant="outline" className="h-10">
                                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                                Refresh
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-6 md:p-8">
                                                    {historyError && (
                                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                                                            {historyError}
                                                        </div>
                                                    )}

                                                    {loadingHistory ? (
                                                        <div className="space-y-3">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <div key={i} className="flex items-center space-x-4">
                                                                    <Skeleton className="h-12 w-full" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : filteredLeaves.length === 0 ? (
                                                        <div className="text-center py-12">
                                                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                            <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests found</h3>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                {statusFilter === 'all' ? "You haven't submitted any leave requests yet." : `No ${statusFilter} leave requests found.`}
                                                            </p>
                                                            <Button 
                                                                className="mt-6" 
                                                                onClick={() => setActiveTab('apply')}
                                                            >
                                                                Apply for Leave
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-md border overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="w-[180px]">Leave Type</TableHead>
                                                                        <TableHead>Duration</TableHead>
                                                                        <TableHead>Date Range</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead className="text-right">Actions</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {filteredLeaves.map((leave) => (
                                                                        <TableRow key={leave._id}>
                                                                            <TableCell className="font-medium">{getLeaveTypeName(leave.leaveType)}</TableCell>
                                                                            <TableCell>{calculateDuration(leave.startDate, leave.endDate)}</TableCell>
                                                                            <TableCell>
                                                                                {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                                                            </TableCell>
                                                                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                                                            <TableCell className="text-right">
                                                                                <Button variant="ghost" size="sm" onClick={() => showDetails(leave)}>
                                                                                    <Eye className="h-4 w-4 mr-1" /> Details
                                                                                </Button>
                                                                                {leave.status === 'pending' && (
                                                                                    <Button
                                                                                        variant="destructive"
                                                                                        size="sm"
                                                                                        className="ml-2"
                                                                                        onClick={() => confirmDelete(leave._id)}
                                                                                    >
                                                                                        <XCircle className="h-4 w-4 mr-1" /> Delete
                                                                                    </Button>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Error Dialog for Insufficient Leave Balance */}
                <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <XCircle className="h-6 w-6 text-red-500" />
                                Insufficient Leave Balance
                            </DialogTitle>
                            <DialogDescription>
                                You don't have enough leave balance for this request.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4 space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <h4 className="text-red-500 font-medium flex items-center mb-2">
                                    <AlertCircle className="h-5 w-5 mr-2" /> Leave Balance Issue
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-80">Leave type:</span>
                                        <Badge variant="outline" className="capitalize">{errorMessage.leaveType} Leave</Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-80">Requested duration:</span>
                                        <Badge variant="outline">{errorMessage.duration} days</Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-80">Available balance:</span>
                                        <Badge variant="outline">
                                            {leaveBalance && errorMessage.leaveType && 
                                             leaveBalance.remaining[errorMessage.leaveType as keyof LeaveBalance]} days
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-medium">
                                        <span className="text-red-500">Shortfall:</span>
                                        <Badge variant="destructive">{errorMessage.shortfall} days</Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="font-medium">Available Options:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <div className="min-w-[20px] mt-1">•</div>
                                        <span>Reduce the duration of your leave request</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="min-w-[20px] mt-1">•</div>
                                        <span>Choose a different leave type with sufficient balance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="min-w-[20px] mt-1">•</div>
                                        <span>Split your leave across multiple leave types</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button
                                className="w-full"
                                onClick={() => setErrorDialogOpen(false)}
                            >
                                I Understand
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Leave Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Leave Request Details</DialogTitle>
                            <DialogDescription>
                                Full information about your leave request
                            </DialogDescription>
                        </DialogHeader>

                        {selectedLeave && (
                            <ScrollArea className="max-h-[70vh]">
                                <div className="space-y-6 py-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Leave Type</p>
                                            <p className="text-base font-medium">{getLeaveTypeName(selectedLeave.leaveType)}</p>
                                        </div>
                                        <div>
                                            {getStatusBadge(selectedLeave.status)}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-sm text-muted-foreground">Date Range</p>
                                        <p className="text-base">
                                            {format(new Date(selectedLeave.startDate), 'MMMM d, yyyy')} - {format(new Date(selectedLeave.endDate), 'MMMM d, yyyy')}
                                            <span className="text-sm text-muted-foreground ml-2">
                                                ({calculateDuration(selectedLeave.startDate, selectedLeave.endDate)})
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted On</p>
                                        <p className="text-base">
                                            {format(new Date(selectedLeave.submittedAt), 'MMMM d, yyyy, h:mm a')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Reason for Leave</p>
                                        <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded-md border mt-1">
                                            {selectedLeave.reason}
                                        </p>
                                    </div>

                                    {selectedLeave.status !== 'pending' && (
                                        <>
                                            <Separator />

                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedLeave.status === 'approved' ? 'Approved' : 'Rejected'} On
                                                </p>
                                                <p className="text-base">
                                                    {selectedLeave.approvedAt ? format(new Date(selectedLeave.approvedAt), 'MMMM d, yyyy, h:mm a') : 'Not available'}
                                                </p>
                                            </div>

                                            {selectedLeave.comments && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Comments</p>
                                                    <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded-md border mt-1">
                                                        {selectedLeave.comments}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Leave Request</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this leave request? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => leaveToDelete && deleteLeave(leaveToDelete)}
                            >
                                <XCircle className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Toast Component */}
                <Toaster position='top-right' richColors/>
            </SidebarProvider>
        </ThemeProvider>
    );
};

export default Leaves;
