import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CustomHeader from '../CustomHeader';
import CustomSidebar from '../CustomSidebar';

const EventsFlowchartPage: React.FC = () => {
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
            EventManagement["Event Management"]
            EventCommentSystem["Event Comment System"]
          end
          
          %% Event Actions
          subgraph EventActions["Event Actions"]
            direction LR
            CreateEvent["Create Event"]
            ViewEvents["View Events List"]
            FilterEvents["Filter & Sort Events"]
            ViewEventDetails["View Event Details"]
            DeleteEvent["Delete Event"]
            UploadImage["Upload Event Image"]
          end
          
          %% Comment Actions
          subgraph CommentActions["Comment Actions"] 
            direction LR
            AddComment["Add Comment"]
            ViewComments["View Comments"]
            ReplyComment["Reply to Comment"]
          end
          
          %% Backend processing
          subgraph BackendProcessing["Backend Processing"]
            direction TB
            EventSubmission["Submit Event Data"] 
            ProcessImage["Process Image Upload"]
            FetchEvents["Fetch Events Data"]
            ManageComments["Process Comments"]
          end
          
          %% Database
          subgraph Database["Database"]
            direction TB
            EventsDB[(Events Collection)]
            CommentsDB[(Comments Collection)]
            UploadsDB[(Image Storage)]
          end
          
          %% Clear connections between components
          UserInterface --> EventActions
          UserInterface --> CommentActions
          
          %% Event creation flow
          CreateEvent --> UploadImage
          UploadImage --> ProcessImage
          ProcessImage --> UploadsDB
          CreateEvent --> EventSubmission
          EventSubmission --> EventsDB
          
          %% Event viewing flow
          ViewEvents --> FetchEvents
          FetchEvents --> EventsDB
          FilterEvents --> FetchEvents
          
          %% Event details flow
          ViewEventDetails --> EventsDB
          ViewEventDetails --> ViewComments
          
          %% Comments flow
          AddComment --> ManageComments
          ReplyComment --> ManageComments
          ManageComments --> CommentsDB
          ViewComments --> CommentsDB
          
          %% Styling
          classDef eventBlock fill:#d4f1f9,stroke:#05728f,stroke-width:2px
          classDef commentBlock fill:#ffdfba,stroke:#ff9642,stroke-width:2px
          classDef databaseBlock fill:#e5e5e5,stroke:#333,stroke-width:2px
          classDef processBlock fill:#d5f5e3,stroke:#1e8449,stroke-width:2px
          classDef containerBlock fill:white,stroke:#cccccc,stroke-width:1px,stroke-dasharray: 5
          
          class UserInterface,EventActions,CommentActions containerBlock
          class BackendProcessing,Database containerBlock
          
          class EventManagement,CreateEvent,ViewEvents,FilterEvents,ViewEventDetails,DeleteEvent,UploadImage eventBlock
          class EventCommentSystem,AddComment,ViewComments,ReplyComment commentBlock
          class EventsDB,CommentsDB,UploadsDB databaseBlock
          class EventSubmission,ProcessImage,FetchEvents,ManageComments processBlock
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
            <CustomHeader title="Events System Flowchart" />
            
            {/* Main Content with Scrolling */}
            <main className="flex-1 w-full overflow-y-auto">
              <div className="flex justify-center w-full py-6">
                <div className="w-full max-w-7xl px-4">
                  <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                      <CardTitle className="text-2xl font-semibold">Events System Flow</CardTitle>
                      <CardDescription className="text-base opacity-90">
                        A high-level overview of the events creation, management and commenting system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold">Diagram Legend:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#d4f1f9', border: '2px solid #05728f' }}></div>
                            <span>Event Actions</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#ffdfba', border: '2px solid #ff9642' }}></div>
                            <span>Comment Actions</span>
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
                          <li>The flowchart shows how events are created, managed and commented on in the system</li>
                          <li>Event actions (blue) represent core event functionality</li>
                          <li>Comment actions (orange) represent the commenting system on events</li>
                          <li>Arrows indicate data flow and relationships between components</li>
                          <li>Database elements (gray) show where different types of information are stored</li>
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

export default EventsFlowchartPage;