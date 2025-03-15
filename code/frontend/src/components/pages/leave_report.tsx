import React, { useState, useEffect } from 'react';
import Layout from "@/components/layout";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Download } from 'lucide-react';

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
    const [leaveReport, setLeaveReport] = useState<LeaveReport>({});
    const [formattedLeaves, setFormattedLeaves] = useState<FormattedLeave[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
                    // Now using userName instead of userId
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

    return (
        <Layout>
            <div className="w-[66vw] h-[88vh]" style={{
                paddingLeft: '34vh',
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Report - {months[selectedMonth]} {selectedYear}</CardTitle>
                        <div className="flex gap-4 mt-4">
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
                                style={{ textDecoration: 'none' }}
                            >
                                {({ blob, url, loading, error }) => (
                                    <Button disabled={loading || formattedLeaves.length === 0}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {loading ? 'Generating PDF...' : 'Download PDF'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
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