import {Home} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"

import NavUser from "@/components/nav-user";

// Menu items.
const items = [
  {
    title: "Home",
    url: "home",
    icon: Home,
  },
  {
    title: "Events",
    url: "events",
    icon: Home,
  },
  {
    title: "Projects",
    url: "projects",
    icon: Home,
  },
  {
    title: "Leave Request",
    url: "leaves",
    icon: Home,
  },
  {
    title: "My Leaves",
    url: "myleaves",
    icon: Home,
  },
  {
    title: "User Requests",
    url: "admin",
    icon: Home,
  },
  {
    title: "View Hierarchy",
    url: "hierarchy",
    icon: Home,
  }

]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Options</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
