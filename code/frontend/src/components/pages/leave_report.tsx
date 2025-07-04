import  { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider";
import CustomSidebar  from '@/components/CustomSidebar';
import CustomHeader  from '@/components/CustomHeader';
import { Download, FileSpreadsheet } from "lucide-react";

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

interface MonthlyHistory {
    userName: string;
    userMonth : number; // Month of registration
    userYear: number; // Year of registration
    monthly: Array<any>; // Or use a more specific type like Array<{ month: string, used: number }>
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
    const [monthlyhistory, setMonthlyHistory] = useState<MonthlyHistory[]>([]);

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
                setMonthlyHistory(data);
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

        // Create workbook with only summary sheet
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
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(fileData, `leave-report-${months[selectedMonth]}-${selectedYear}.xlsx`);
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
            
            // Only create the Yearly Monthly Breakdown sheet
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
            data.forEach((user: MonthlyHistory) => {
                try {
                    const row = [];
                    row.push(user.userName || 'Unknown');
                    const userMonth = user.userMonth;
                    const userYear = user.userYear;
                    const userLeaves = user.monthly;
                    yearsToShow.forEach(year => {
                        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                            if (year === userYear && monthIndex < userMonth) {
                                row.push(0);
                                row.push(0);
                                row.push(0);
                                continue; // Skip months before the user's registration month
                            }
                            if(year < userYear){
                                row.push(0);
                                row.push(0);
                                row.push(0);
                                continue; // Skip years before the user's registration year
                            }
                            const monthData = userLeaves.find((leave: any) => leave.month === monthIndex && leave.year === year);
                            if(!monthData) {
                                row.push(0); // Sick leave
                                row.push(0); // Casual leave
                                row.push(0); // Earned leave
                                continue;
                            }
                            const remaining = monthData ? monthData.remaining : 0;
                            console.log("hi");
                            console.log(remaining.sick);
                            row.push(remaining.sick || 0); // Sick leave
                            row.push(remaining.casual || 0); // Casual leave
                            row.push(remaining.earned || 0); // Earned leave
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
        <ThemeProvider>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Custom Sidebar */}
                <CustomSidebar />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {/* Custom Header */}
                    <CustomHeader title="Leave Reports" />

                    {/* Main Content with Scrolling */}
                    <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
                        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-medium mb-4">
                                        Leave Report - {months[selectedMonth]} {selectedYear}
                                    </CardTitle>
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
                                        <div className="mt-4 overflow-x-auto">
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
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default LeaveReport;