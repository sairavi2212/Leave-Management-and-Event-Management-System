import React, { useEffect, useState } from 'react';
import Layout from "@/components/layout";
import { format } from 'date-fns';
import {
  Check,
  Clock,
  X,
  CalendarIcon,
  RefreshCcw,
  Filter,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // Ensure this path is correct or replace with the correct path
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
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
      setError(error instanceof Error ? error.message : 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
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

  return (
    <Layout>
    <div style={{
                    paddingLeft: '50vh',
                    paddingRight: '0vh',
                    width: '130vh',
                    height: '30vh',
                }}>
      <Card className="shadow-md">
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-medium">My Leave History</CardTitle>
              <CardDescription className="text-base mt-1">View and manage your leave requests</CardDescription>
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
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
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
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {statusFilter === 'all' ? "You haven't submitted any leave requests yet." : `No ${statusFilter} leave requests found.`}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
                  <p className="text-base bg-gray-50 p-3 rounded-md border mt-1">
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
                        <p className="text-base bg-gray-50 p-3 rounded-md border mt-1">
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
    </div>
    </Layout>
  );
};

export default MyLeaves;