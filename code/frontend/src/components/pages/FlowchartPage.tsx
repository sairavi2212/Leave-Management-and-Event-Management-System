import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CustomHeader from '../CustomHeader';
import CustomSidebar from '../CustomSidebar';

const FlowchartPage: React.FC = () => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: false,
        rankSpacing: 80,
        nodeSpacing: 80,
        diagramPadding: 20
      }
    });
    
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = `
      <div class="mermaid">
        flowchart TB
          %% Main Components - Top Level
          subgraph UserInterface["User Interface"]
            direction TB
            UserLeaveManagement["User Leave Management"]
            AdminLeaveManagement["Admin Leave Management"]
          end
          
          %% User workflows
          subgraph UserActions["User Actions"]
            direction LR
            ApplyLeave["Apply for Leave"]
            ViewBalance["View Leave Balance"]
            ViewHistory["View Leave History"]
            DeletePending["Delete Pending Requests"]
            ViewNotifications["View Notifications"]
          end
          
          %% Admin workflows
          subgraph AdminActions["Admin Actions"]
            direction LR
            ApproveDeny["Approve/Reject Leave"]
            ViewAllRequests["View All Requests"]
            FilterRequests["Filter By Status"]
            AddComments["Add Comments"]
          end
          
          %% Backend processing
          subgraph BackendProcessing["Backend Processing"]
            direction TB
            CheckBalance["Check Available Balance"]
            LeaveSubmission["Submit Leave Request"] 
            UpdateStatus["Update Leave Status"]
            GenerateNotification["Generate Notification"]
            UpdateBalance["Update Leave Balance"]
          end
          
          %% Database
          subgraph Database["Database"]
            direction TB
            LeaveDB[(Leaves Collection)]
            NotificationDB[(Notifications)]
          end
          
          %% Clear connections between components
          UserInterface --> UserActions
          UserInterface --> AdminActions
          
          %% User flow connections - straighter lines
          ApplyLeave --> CheckBalance
          CheckBalance --> LeaveSubmission
          LeaveSubmission --> LeaveDB
          
          %% Admin flow connections
          ApproveDeny --> UpdateStatus
          UpdateStatus --> LeaveDB
          UpdateStatus --> GenerateNotification
          UpdateStatus --> UpdateBalance
          
          %% Data retrieval flows
          LeaveDB --> ViewBalance
          LeaveDB --> ViewHistory
          LeaveDB --> ViewAllRequests
          
          %% Notification flow
          GenerateNotification --> NotificationDB
          NotificationDB --> ViewNotifications
          
          %% Styling
          classDef userBlock fill:#d4f1f9,stroke:#05728f,stroke-width:2px
          classDef adminBlock fill:#ffdfba,stroke:#ff9642,stroke-width:2px
          classDef databaseBlock fill:#e5e5e5,stroke:#333,stroke-width:2px
          classDef processBlock fill:#d5f5e3,stroke:#1e8449,stroke-width:2px
          classDef containerBlock fill:white,stroke:#cccccc,stroke-width:1px,stroke-dasharray: 5
          
          class UserInterface,UserActions containerBlock
          class AdminActions containerBlock
          class BackendProcessing containerBlock
          class Database containerBlock
          
          class UserLeaveManagement,ApplyLeave,ViewBalance,ViewHistory,DeletePending,ViewNotifications userBlock
          class AdminLeaveManagement,ApproveDeny,ViewAllRequests,FilterRequests,AddComments adminBlock
          class LeaveDB,NotificationDB databaseBlock
          class CheckBalance,LeaveSubmission,UpdateStatus,GenerateNotification,UpdateBalance processBlock
      </div>
      `;
      mermaid.contentLoaded();
    }
  }, []);

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <CustomSidebar />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            {/* Header with sidebar trigger and theme toggle */}
            <CustomHeader title="Leave Management System Flowchart" />
            
            {/* Main Content with Scrolling */}
            <main className="flex-1 w-full overflow-y-auto">
              <div className="flex justify-center w-full py-6">
                <div className="w-full max-w-7xl px-4">
                  <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                      <CardTitle className="text-2xl font-semibold">Leave Management System Flow</CardTitle>
                      <CardDescription className="text-base opacity-90">
                        A high-level overview of the leave application and approval process
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold">Diagram Legend:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#d4f1f9', border: '2px solid #05728f' }}></div>
                            <span>User Actions</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#ffdfba', border: '2px solid #ff9642' }}></div>
                            <span>Admin Actions</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#e5e5e5', border: '2px solid #333' }}></div>
                            <span>Database</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#d5f5e3', border: '2px solid #1e8449' }}></div>
                            <span>System Process</span>
                          </div>
                        </div>
                      </div>
                      
                      <div ref={mermaidRef} className="mermaid-container w-full overflow-x-auto" style={{ minHeight: "600px" }}></div>
                      
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p className="mb-2"><strong>How to read this diagram:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>The flowchart shows how leave requests are processed in the system</li>
                          <li>User actions (blue) represent what employees can do in the system</li>
                          <li>Admin actions (orange) represent what managers and administrators can do</li>
                          <li>Arrows indicate the flow of information between different parts of the system</li>
                          <li>Database elements (gray) show where information is stored</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default FlowchartPage;