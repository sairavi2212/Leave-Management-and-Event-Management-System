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
import { useState , useEffect} from "react";

interface User {
  name: string;
  email: string;
  role: string;
}

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
    title: "Leave Report",
    url: "leave-report",
    icon: Home,
  }
]

export function AppSidebar() {
  const  [userData, setUserData] = useState<User>({name: "", email: "", role: ""});

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData({ name: data.name, email: data.email, role: data.role });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);


  if((userData.role === "admin" || userData.role === "superadmin") ) {
    if(!items.some(e => e.title === "Leave Requests")){
      items.push({
        title: "Leave Requests",
        url: "admin",
        icon: Home,
      })
    }
  }

  if(userData.role === "superadmin") {
    if(!items.some(e => e.title === "Register User")){
      items.push({
        title: "Register User",
        url: "register-user",
        icon: Home,
      })
    }
  }

  if(userData.role === "admin" || userData.role === "user") {
    // add myleaves and leave request
    if(!items.some(e => e.title === "Leave Management")){
      items.push({
        title: "Leave Management",
        url: "leaves",
        icon: Home,
      })
    }
    // if(!items.some(e => e.title === "My Leaves")){
    //   items.push({
    //     title: "My Leaves",
    //     url: "myleaves",
    //     icon: Home,
    //   })
    // }
  }
  
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
