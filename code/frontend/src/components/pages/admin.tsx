import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { ThemeProvider } from "@/components/theme-provider";
import CustomSidebar from "@/components/CustomSidebar";
import CustomHeader from "@/components/CustomHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import {
  CalendarIcon,
  Check,
  Clock,
  Filter,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Leave {
  _id: string;
  userId: User;
  user?: User;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  comments?: string;
  approvedBy?: string;
  approvedAt?: string;
}

const commentSchema = z.object({
  comments: z.string().min(1, "Comment is required").max(
    500,
    "Comment must be less than 500 characters",
  ),
});

const AdminLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const intervalRef = useRef<number | null>(null);

  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comments: "",
    },
  });

  useEffect(() => {
    fetchLeaves();
    
    // Set up the interval for auto-refresh
    intervalRef.current = window.setInterval(() => {
      fetchLeaves(true);
      setLastRefreshed(new Date());
    }, 10000); // 10 seconds
    
    // Clean up the interval on component unmount
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [statusFilter]);

  const fetchLeaves = async (isAutoRefresh = false) => {
    // Only show loading indicator for manual refreshes, not auto-refreshes
    if (!isAutoRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/leaves/subordinate",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch leave requests");
      }

      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch leave requests",
      );
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Also comment out the handleAction function to avoid API calls
  const handleAction = async (
    status: "approved" | "rejected",
    comments: string,
  ) => {
    if (!selectedLeave) return;

    setActionLoading(true);
    setActionSuccess(null);

    try {
      // Comment out the actual API call

      const response = await fetch(
        `http://localhost:5000/api/leaves/${selectedLeave._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status,
            comments,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${
              status === "approved" ? "approve" : "reject"
            } leave request`,
        );
      }

      setLeaves(
        leaves.map((leave) =>
          leave._id === selectedLeave._id
            ? { ...leave, status, comments }
            : leave
        ),
      );

      setActionSuccess(
        `Leave request ${
          status === "approved" ? "approved" : "rejected"
        } successfully`,
      );

      // Close dialog after a short delay
      setTimeout(() => {
        setActionDialogOpen(false);
        setActionSuccess(null);
        commentForm.reset();
        // Don't call fetchLeaves to avoid API call
        fetchLeaves();
      }, 1500);
    } catch (error) {
      console.error(
        `Error ${status === "approved" ? "approving" : "rejecting"} leave:`,
        error,
      );
      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${
            status === "approved" ? "approve" : "reject"
          } leave request`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const getLeaveTypeName = (type: string) => {
    switch (type) {
      case "sick":
        return "Sick Leave";
      case "casual":
        return "Casual Leave";
      case "earned":
        return "Earned Leave";
      case "unpaid":
        return "Unpaid Leave";
      default:
        return type;
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const openActionDialog = (leave: Leave, action: "approve" | "reject") => {
    setSelectedLeave(leave);
    setActionType(action);
    setActionDialogOpen(true);
    commentForm.reset();
  };

  const showDetails = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsOpen(true);
  };

  const filteredLeaves = leaves
    .filter((leave) => statusFilter === "all" || leave.status === statusFilter)
    .filter((leave) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const userName = leave.userId?.name?.toLowerCase() || "";
      const userEmail = leave.userId.email?.toLowerCase() || "";
      const leaveType = getLeaveTypeName(leave.leaveType).toLowerCase();

      return userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        leaveType.includes(searchLower);
    });

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Custom Sidebar */}
        <CustomSidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Custom Header */}
          <CustomHeader title="Leave Requests" />

          {/* Main Content with Scrolling */}
          <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
              <Card className="shadow-md">
                <CardHeader className="pb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-medium">
                        Leave Requests
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Review and manage employee leave requests
                        {/* <div className="text-xs text-muted-foreground mt-1">
                          Last refreshed: {format(lastRefreshed, "hh:mm:ss a")}
                        </div> */}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center">
                        <Input
                          placeholder="Search employees..."
                          className="w-full sm:w-64 h-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4 text-gray-500" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-36 h-10">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => fetchLeaves()}
                        variant="outline"
                        className="h-10"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-6">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">
                        No leave requests found
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {statusFilter === "all"
                          ? "There are no leave requests."
                          : `No ${statusFilter} leave requests found.`}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Employee</TableHead>
                              <TableHead>Leave Type</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Date Range</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLeaves.map((leave) => (
                              <TableRow key={leave._id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src="" alt={leave.userId.name} />
                                      <AvatarFallback>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {leave.userId.name || "Employee"}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {leave.userId.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getLeaveTypeName(leave.leaveType)}
                                </TableCell>
                                <TableCell>
                                  {calculateDuration(leave.startDate, leave.endDate)}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(leave.startDate), "MMM dd, yyyy")}{" "}
                                  - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => showDetails(leave)}
                                    >
                                      Details
                                    </Button>

                                    {leave.status === "pending" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                          onClick={() =>
                                            openActionDialog(leave, "approve")}
                                        >
                                          <ThumbsUp className="h-4 w-4 mr-1" />{" "}
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                          onClick={() =>
                                            openActionDialog(leave, "reject")}
                                        >
                                          <ThumbsDown className="h-4 w-4 mr-1" />{" "}
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Full information about this leave request
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Leave Type
                    </p>
                    <p className="text-base font-medium">
                      {getLeaveTypeName(selectedLeave.leaveType)}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="text-base font-medium">
                    {selectedLeave.userId.name || "Employee"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLeave.userId.email}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="text-base">
                    {format(
                      new Date(selectedLeave.startDate),
                      "MMMM d, yyyy",
                    )} -{" "}
                    {format(new Date(selectedLeave.endDate), "MMMM d, yyyy")}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({calculateDuration(
                        selectedLeave.startDate,
                        selectedLeave.endDate,
                      )})
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Submitted On
                  </p>
                  <p className="text-base">
                    {format(
                      new Date(selectedLeave.submittedAt),
                      "MMMM d, yyyy, h:mm a",
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Reason for Leave
                  </p>
                  <p className="text-base bg-gray-50 p-3 rounded-md border mt-1 text-gray-800">
                    {selectedLeave.reason || "No reason provided"}
                  </p>
                </div>

                {selectedLeave.status !== "pending" && (
                  <>
                    <Separator />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedLeave.status === "approved"
                          ? "Approved"
                          : "Rejected"} On
                      </p>
                      <p className="text-base">
                        {selectedLeave.approvedAt
                          ? format(
                            new Date(selectedLeave.approvedAt),
                            "MMMM d, yyyy, h:mm a",
                          )
                          : "Not available"}
                      </p>
                    </div>

                    {selectedLeave.comments && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Comments
                        </p>
                        <p className="text-base bg-gray-50 p-3 rounded-md border mt-1 text-gray-800">
                          {selectedLeave.comments}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {selectedLeave?.status === "pending" && (
            <DialogFooter>
              <div className="flex gap-2 justify-end w-full">
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    setDetailsOpen(false);
                    openActionDialog(selectedLeave, "approve");
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setDetailsOpen(false);
                    openActionDialog(selectedLeave, "reject");
                  }}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Leave Request"
                : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Provide any additional notes for this approval."
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          {actionSuccess
            ? (
              <div className="py-6 flex flex-col items-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-center font-medium">{actionSuccess}</p>
              </div>
            )
            : (
              <Form {...commentForm}>
                <form
                  onSubmit={commentForm.handleSubmit((data) =>
                    handleAction(
                      actionType === "approve" ? "approved" : "rejected",
                      data.comments,
                    )
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={commentForm.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={actionType === "approve"
                              ? "Any notes for the employee (required)"
                              : "Please provide rejection reason"}
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActionDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className={actionType === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"}
                    >
                      {actionLoading
                        ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {actionType === "approve"
                              ? "Approving..."
                              : "Rejecting..."}
                          </>
                        )
                        : (
                          <>
                            {actionType === "approve"
                              ? (
                                <>
                                  <ThumbsUp className="mr-2 h-4 w-4" />{" "}
                                  Approve
                                </>
                              )
                              : (
                                <>
                                  <ThumbsDown className="mr-2 h-4 w-4" />{" "}
                                  Reject
                                </>
                              )}
                          </>
                        )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default AdminLeaves;
