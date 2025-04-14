import { useState, useEffect } from 'react';
import Layout from "@/components/layout";
import { format, differenceInMonths } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Updated interface to match backend response with names
interface LeaveReport {
    [userName: string]: {
        [leaveType: string]: number;
    }
}

interface FormattedLeave {
    userName: string;
    sick: number;
    casual: number;
    earned: number;
    unpaid: number;
    total: number;
}

// Interface for detailed leave history of users
interface DetailedLeaveData {
    userId: string;
    userName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: number;
    reason: string;
    status: string;
    submittedAt: string;
}

// Interface for historical leave balance
interface LeaveBalance {
    sick: number;
    casual: number;
    earned: number;
}

interface HistoricalLeaveData {
    userName: string;
    allocated: LeaveBalance;
    used: LeaveBalance;
    remaining: LeaveBalance;
    registrationDate: string;
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({length: 5}, (_, i) => currentYear - i);

// Define PDF styles
const styles = StyleSheet.create({
    page: { padding: 30 },
    title: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
    table: { width: '100%', marginTop: 10 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', padding: 5 },
    headerRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#000000', padding: 5, fontWeight: 'bold', backgroundColor: '#f0f0f0' },
    cell: { padding: 5, flex: 1, fontSize: 10 },
    footer: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 10 }
});

// PDF Document Component
const PDFDocument = ({ formattedLeaves, month, year }: { formattedLeaves: FormattedLeave[], month: number, year: number }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Leave Report</Text>
            <Text style={styles.subtitle}>{months[month]} {year}</Text>
            
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <Text style={styles.cell}>Employee Name</Text>
                    <Text style={styles.cell}>Sick Leave</Text>
                    <Text style={styles.cell}>Casual Leave</Text>
                    <Text style={styles.cell}>Earned Leave</Text>
                    <Text style={styles.cell}>Unpaid Leave</Text>
                    <Text style={styles.cell}>Total Days</Text>
                </View>
                
                {formattedLeaves.map((leave, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.cell}>{leave.userName}</Text>
                        <Text style={styles.cell}>{leave.sick} days</Text>
                        <Text style={styles.cell}>{leave.casual} days</Text>
                        <Text style={styles.cell}>{leave.earned} days</Text>
                        <Text style={styles.cell}>{leave.unpaid} days</Text>
                        <Text style={styles.cell}>{leave.total} days</Text>
                    </View>
                ))}
            </View>
            
            <Text style={styles.footer}>Generated on {format(new Date(), 'PPP')}</Text>
        </Page>
    </Document>
);

const LeaveReport = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);
    // Using underscore prefix to indicate intentionally unused variable
    const [_, setLeaveReport] = useState<LeaveReport>({});
    const [formattedLeaves, setFormattedLeaves] = useState<FormattedLeave[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [detailedLeaveData, setDetailedLeaveData] = useState<DetailedLeaveData[]>([]);
    const [historicalLeaveData, setHistoricalLeaveData] = useState<HistoricalLeaveData[]>([]);
    const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
    const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

    // Fetch summary leave data for the selected month and year
    useEffect(() => {
        const fetchLeaves = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/leaves/report?month=${selectedMonth + 1}&year=${selectedYear}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setLeaveReport(data);
                    
                    // Transform the report object into an array for display
                    const formatted = Object.entries(data).map(([userName, leaveTypes]) => {
                        const typedLeaveTypes = leaveTypes as {[key: string]: number};
                        
                        return {
                            userName,
                            sick: typedLeaveTypes.sick || 0,
                            casual: typedLeaveTypes.casual || 0,
                            earned: typedLeaveTypes.earned || 0,
                            unpaid: typedLeaveTypes.unpaid || 0,
                            total: Object.values(typedLeaveTypes).reduce((sum, days) => sum + days, 0)
                        };
                    });
                    
                    setFormattedLeaves(formatted);
                }
            } catch (error) {
                console.error('Error fetching leaves:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaves();
    }, [selectedMonth, selectedYear]);

    // Fetch detailed leave data for Excel export (when needed)
    const fetchDetailedLeaveData = async () => {
        setIsLoadingDetailed(true);
        try {
            // This endpoint would need to be added to the backend to provide detailed information
            const response = await fetch(`http://localhost:5000/api/leaves/detailed-report?month=${selectedMonth + 1}&year=${selectedYear}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setDetailedLeaveData(data);
                return data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching detailed leave data:', error);
            return [];
        } finally {
            setIsLoadingDetailed(false);
        }
    };

    // Fetch historical leave data for all users (when needed)
    const fetchHistoricalLeaveData = async () => {
        setIsLoadingHistorical(true);
        try {
            // This endpoint would need to be added to the backend to provide historical information
            const response = await fetch(`http://localhost:5000/api/leaves/historical-report`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setHistoricalLeaveData(data);
                return data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching historical leave data:', error);
            return [];
        } finally {
            setIsLoadingHistorical(false);
        }
    };

    // Export monthly detailed leave data to Excel
    const exportDetailedMonthlyExcel = async () => {
        // Fetch detailed leave data if not already loaded
        const data = detailedLeaveData.length > 0 ? detailedLeaveData : await fetchDetailedLeaveData();
        if (!data || data.length === 0) {
            alert('No detailed leave data available for export');
            return;
        }

        // Group leave data by user using a different approach
        const groupedByUser: Record<string, DetailedLeaveData[]> = {};
        
        // Populate the groupedByUser object
        for (const leave of data) {
            if (!groupedByUser[leave.userName]) {
                groupedByUser[leave.userName] = [];
            }
            groupedByUser[leave.userName].push(leave);
        }

        // Create workbook with a worksheet for each user
        const workbook = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryData = formattedLeaves.map(leave => ({
            'Employee Name': leave.userName,
            'Sick Leave (days)': leave.sick,
            'Casual Leave (days)': leave.casual,
            'Earned Leave (days)': leave.earned,
            'Unpaid Leave (days)': leave.unpaid,
            'Total Days': leave.total
        }));
        
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Create detailed sheet for each user
        Object.entries(groupedByUser).forEach((entry) => {
            const userName = entry[0];
            const userLeaves = entry[1] as DetailedLeaveData[];
            
            // Format data for Excel
            const userData = userLeaves.map((leave: DetailedLeaveData) => ({
                'Leave Type': leave.leaveType,
                'Start Date': format(new Date(leave.startDate), 'yyyy-MM-dd'),
                'End Date': format(new Date(leave.endDate), 'yyyy-MM-dd'),
                'Duration (days)': leave.duration,
                'Status': leave.status,
                'Reason': leave.reason,
                'Submitted On': format(new Date(leave.submittedAt), 'yyyy-MM-dd')
            }));
            
            const userSheet = XLSX.utils.json_to_sheet(userData);
            // Limit sheet name length to 31 chars (Excel limitation)
            const safeSheetName = userName.substring(0, 31);
            XLSX.utils.book_append_sheet(workbook, userSheet, safeSheetName);
        });
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(fileData, `detailed-leave-report-${months[selectedMonth]}-${selectedYear}.xlsx`);
    };

    // Export complete historical leave data to Excel
    const exportHistoricalExcel = async () => {
        try {
            // Fetch historical leave data if not already loaded
            const data = historicalLeaveData.length > 0 ? historicalLeaveData : await fetchHistoricalLeaveData();
            if (!data || data.length === 0) {
                alert('No historical leave data available for export');
                return;
            }

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Add a summary sheet with all the important information
            const summaryData = data.map((user: HistoricalLeaveData) => {
                try {
                    const registrationDate = new Date(user.registrationDate);
                    const now = new Date();
                    const monthsSinceRegistration = differenceInMonths(now, registrationDate) + 1;
                    
                    return {
                        'Employee Name': user.userName || 'Unknown',
                        'Registration Date': format(registrationDate, 'yyyy-MM-dd'),
                        'Months Active': monthsSinceRegistration,
                        'Sick Leave Allocated': user.allocated?.sick || 0,
                        'Sick Leave Used': user.used?.sick || 0,
                        'Sick Leave Remaining': user.remaining?.sick || 0,
                        'Casual Leave Allocated': user.allocated?.casual || 0,
                        'Casual Leave Used': user.used?.casual || 0,
                        'Casual Leave Remaining': user.remaining?.casual || 0,
                        'Earned Leave Allocated': user.allocated?.earned || 0,
                        'Earned Leave Used': user.used?.earned || 0,
                        'Earned Leave Remaining': user.remaining?.earned || 0,
                        'Total Allocated': 
                            (user.allocated?.sick || 0) + 
                            (user.allocated?.casual || 0) + 
                            (user.allocated?.earned || 0),
                        'Total Used': 
                            (user.used?.sick || 0) + 
                            (user.used?.casual || 0) + 
                            (user.used?.earned || 0),
                        'Total Remaining': 
                            (user.remaining?.sick || 0) + 
                            (user.remaining?.casual || 0) + 
                            (user.remaining?.earned || 0)
                    };
                } catch (error) {
                    console.error('Error processing user data:', error);
                    return {
                        'Employee Name': user.userName || 'Error processing user',
                        'Error': 'Could not process user data'
                    };
                }
            });
            
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Leave Summary');
            
            // Create detailed year-month-category hierarchical sheet
            // We'll create a structured format with years as main columns, months as subcolumns,
            // and each leave type (sick, casual, earned) as subcolumns within each month
            
            const yearMonthSheet = XLSX.utils.aoa_to_sheet([[]]);
            XLSX.utils.book_append_sheet(workbook, yearMonthSheet, 'Yearly Monthly Breakdown');
            
            // Get range of years from data (assuming we want at least current year and previous year)
            const currentYear = new Date().getFullYear();
            const yearsToShow = [currentYear - 1, currentYear, currentYear + 1];
            
            // Setup header structure with hierarchical columns for years, months, and leave types
            // First row: Year spans all 12 months × 3 types (36 columns per year)
            // Second row: Month name spans 3 columns (one for each leave type)
            // Third row: Leave type names (Sick, Casual, Earned)
            
            // Create the header rows
            const headerRow1 = ['Employee']; // First cell is for employee names
            const headerRow2 = [''];
            const headerRow3 = [''];
            
            // Populate headers for each year, month, and leave type
            yearsToShow.forEach(year => {
                // Each year has 12 months × 3 leave types = 36 columns
                headerRow1.push(year.toString()); // Year header
                // Add empty cells for the remaining columns under this year
                for (let i = 0; i < 35; i++) {
                    headerRow1.push('');
                }
                
                // For each month in the year
                months.forEach(month => {
                    headerRow2.push(month); // Month header
                    // Add empty cells for the remaining columns under this month
                    headerRow2.push('');
                    headerRow2.push('');
                    
                    // Add the leave type headers for this month
                    headerRow3.push('Sick');
                    headerRow3.push('Casual');
                    headerRow3.push('Earned');
                });
            });
            
            // Apply the headers to the sheet
            XLSX.utils.sheet_add_aoa(yearMonthSheet, [headerRow1, headerRow2, headerRow3], { origin: 'A1' });
            
            // Generate rows for each user
            let rowIndex = 4; // Start after the header rows
            
            data.forEach((user: HistoricalLeaveData) => {
                try {
                    const row = [];
                    row.push(user.userName || 'Unknown');
                    
                    // Assuming the backend would provide monthly breakdown data
                    // For demonstration, we'll fill with placeholder values
                    // In a real implementation, you would access actual monthly data from the API
                    
                    yearsToShow.forEach(year => {
                        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                            // For each month, add values for sick, casual, earned leave remaining
                            // These would come from your API data in a real implementation
                            
                            // For demo: different remaining values based on month (in a real app, get from API)
                            const sickRemaining = user.remaining?.sick || 0;
                            const casualRemaining = user.remaining?.casual || 0;
                            const earnedRemaining = user.remaining?.earned || 0;
                            
                            row.push(sickRemaining);
                            row.push(casualRemaining);
                            row.push(earnedRemaining);
                        }
                    });
                    
                    // Add the user's row to the sheet
                    XLSX.utils.sheet_add_aoa(yearMonthSheet, [row], { origin: `A${rowIndex}` });
                    rowIndex++;
                    
                } catch (error) {
                    console.error('Error creating row for user:', user.userName, error);
                }
            });
            
            // Apply column spans for the hierarchical headers using the worksheet's mergeCells configuration
            // Year headers span 36 columns (12 months × 3 leave types)
            // Month headers span 3 columns (3 leave types)
            const mergeCells = [];
            
            // Merge year headers
            for (let i = 0; i < yearsToShow.length; i++) {
                const startCol = 1 + (i * 36); // Column B for first year, AK for second, etc.
                const endCol = startCol + 35;  // 36 columns per year
                
                // Convert column indices to Excel column references (e.g., 1 -> A, 2 -> B)
                const startColRef = XLSX.utils.encode_col(startCol);
                const endColRef = XLSX.utils.encode_col(endCol);
                
                mergeCells.push({ s: { r: 0, c: startCol }, e: { r: 0, c: endCol } });
            }
            
            // Merge month headers (each month spans 3 columns for leave types)
            for (let yearIdx = 0; yearIdx < yearsToShow.length; yearIdx++) {
                for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
                    const startCol = 1 + (yearIdx * 36) + (monthIdx * 3);
                    const endCol = startCol + 2; // 3 columns per month
                    
                    mergeCells.push({ s: { r: 1, c: startCol }, e: { r: 1, c: endCol } });
                }
            }
            
            // Apply the merges to the worksheet
            yearMonthSheet['!merges'] = mergeCells;
            
            // Format the headers with background colors and borders
            // Note: This would require a more complex implementation using the xlsx-style
            // library which is an extension to xlsx
            
            // Create individual sheets for each leave type with simplified data (keep for reference)
            const leaveTypes = [
                { id: 'sick', name: 'Sick Leave' },
                { id: 'casual', name: 'Casual Leave' },
                { id: 'earned', name: 'Earned Leave' }
            ];
            
            leaveTypes.forEach(({ id, name }) => {
                const typeData = data.map((user: HistoricalLeaveData) => {
                    try {
                        return {
                            'Employee': user.userName || 'Unknown',
                            'Registration Date': format(new Date(user.registrationDate), 'yyyy-MM-dd'),
                            'Allocated': user.allocated?.[id as keyof LeaveBalance] || 0,
                            'Used': user.used?.[id as keyof LeaveBalance] || 0,
                            'Remaining': user.remaining?.[id as keyof LeaveBalance] || 0
                        };
                    } catch (error) {
                        console.error(`Error processing ${name} data for user:`, error);
                        return {
                            'Employee': user.userName || 'Error',
                            'Error': `Could not process ${name} data`
                        };
                    }
                });
                
                const typeSheet = XLSX.utils.json_to_sheet(typeData);
                XLSX.utils.book_append_sheet(workbook, typeSheet, name);
            });
            
            // Generate Excel file
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(fileData, `leave-balance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
            
        } catch (error) {
            console.error('Error exporting historical data:', error);
            alert('An error occurred while exporting data. Please try again.');
        }
    };

    return (
        <Layout>
            <div className="w-[66vw] h-[88vh]" style={{
                paddingLeft: '34vh',
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Report - {months[selectedMonth]} {selectedYear}</CardTitle>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Select 
                                value={selectedMonth.toString()} 
                                onValueChange={(value) => setSelectedMonth(parseInt(value))}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month, index) => (
                                        <SelectItem key={index} value={index.toString()}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select 
                                value={selectedYear.toString()} 
                                onValueChange={(value) => setSelectedYear(parseInt(value))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <PDFDownloadLink 
                                document={
                                    <PDFDocument 
                                        formattedLeaves={formattedLeaves} 
                                        month={selectedMonth} 
                                        year={selectedYear} 
                                    />
                                }
                                fileName={`leave-report-${months[selectedMonth]}-${selectedYear}.pdf`}
                                className="no-underline"
                            >
                                {({ loading }) => (
                                    <div className="inline-block">
                                        <Button disabled={loading || formattedLeaves.length === 0}>
                                            <Download className="h-4 w-4 mr-2" />
                                            {loading ? 'Generating PDF...' : 'Download PDF'}
                                        </Button>
                                    </div>
                                )}
                            </PDFDownloadLink>

                            <Button 
                                onClick={exportDetailedMonthlyExcel} 
                                disabled={isLoadingDetailed || formattedLeaves.length === 0}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                {isLoadingDetailed ? 'Preparing...' : 'Export Detailed Excel'}
                            </Button>

                            <Button 
                                onClick={exportHistoricalExcel} 
                                disabled={isLoadingHistorical}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                {isLoadingHistorical ? 'Preparing...' : 'Export Complete History'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : formattedLeaves.length > 0 ? (
                            <div className="mt-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 text-left">Employee Name</th>
                                            <th className="py-2 text-left">Sick Leave</th>
                                            <th className="py-2 text-left">Casual Leave</th>
                                            <th className="py-2 text-left">Earned Leave</th>
                                            <th className="py-2 text-left">Unpaid Leave</th>
                                            <th className="py-2 text-left">Total Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formattedLeaves.map((leave, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{leave.userName}</td>
                                                <td className="py-2">{leave.sick} days</td>
                                                <td className="py-2">{leave.casual} days</td>
                                                <td className="py-2">{leave.earned} days</td>
                                                <td className="py-2">{leave.unpaid} days</td>
                                                <td className="py-2">{leave.total} days</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">No leave data found for this period</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default LeaveReport;