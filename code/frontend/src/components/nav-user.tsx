import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "./ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, ChevronsUpDown, BadgeCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

export default function NavUser() {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({name:"", email:""});

    useEffect(() => {
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
                    setUserData({ name: data.firstName, email: data.email });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/',{replace:true});
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <SidebarMenuButton
                            className="w-full h-auto py-3 px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-9 w-9 flex-shrink-0 rounded-lg mr-2">
                                <AvatarImage src="" alt={userData.name} />
                                <AvatarFallback className="rounded-lg">
                                    <UserRound />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium truncate text-sm">
                                    {userData.name || "User"}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {userData.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-2 flex-shrink-0 h-4 w-4 opacity-70" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src="" alt={userData.name} />
                                    <AvatarFallback className="rounded-lg">
                                        <UserRound />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-semibold truncate">
                                        {userData.name || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {userData.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                Account
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
