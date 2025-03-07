import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ThemeProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <main>
                        <div style={{ display: "flex", flexDirection: "column"}}>
                        <div style={{padding: "0.25rem"}}>
                        <SidebarTrigger />
                        </div>
                        <ModeToggle />
                        </div>
                        {children}
                    </main>
                </SidebarProvider>
            </ThemeProvider>
        </>
    );
}
