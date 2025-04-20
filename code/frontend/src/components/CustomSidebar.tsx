import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Package, 
  FileText, 
  FileCheck, 
  UserPlus, 
  Menu,
  X,
  ChevronRight,
  LogOut,
  UserCircle,
  Sun,
  Moon,
  MapPin,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";

interface User {
  name: string;
  email: string;
  role: string;
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const CustomSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<User>({ name: "", email: "", role: "" });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Package,
    },
    {
      title: "Leave Report",
      url: "/leave-report",
      icon: FileText,
    }
  ]);
  
  // Handle click outside to close mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch user data
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
          const name = data.firstName || data.name || "User";
          setUserData({ 
            name, 
            email: data.email || "", 
            role: data.role || "" 
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Update menu items based on user role
  useEffect(() => {
    const items = [...menuItems];

    if (userData.role === "admin" || userData.role === "superadmin") {
      if (!items.some(e => e.title === "Leave Requests")) {
        items.push({
          title: "Leave Requests",
          url: "/admin",
          icon: FileCheck,
        });
      }
    }

    if (userData.role === "superadmin") {
      if (!items.some(e => e.title === "Register User")) {
        items.push({
          title: "Register User",
          url: "/register-user",
          icon: UserPlus,
        });
      }
    }

    if (userData.role === "superadmin" ) {
      if (!items.some(e => e.title === "Location")) {
        items.push({
          title: "Location",
          url: "/locations",
          icon: MapPin,
        });
      }
    }

    if (userData.role === "admin" || userData.role === "user") {
      if (!items.some(e => e.title === "Leave Management")) {
        items.push({
          title: "Leave Management",
          url: "/leaves",
          icon: Calendar,
        });
      }
    }

    setMenuItems(items);
  }, [userData.role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  // Sidebar collapse handler
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Navigate to profile page
  const goToProfile = () => {
    navigate('/profile');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || !isMobile) && (
          <motion.div
            ref={sidebarRef}
            initial={isMobile ? { x: -280 } : { x: 0 }}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -280 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl
                        ${isMobile ? "w-64" : isCollapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col h-full">
              {/* Logo and collapse button */}
              <div className={`flex items-center justify-between px-4 h-16 border-b border-slate-700`}>
                {(!isCollapsed || isMobile) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Eklavya</h1>
                  </motion.div>
                )}
                
                {isCollapsed && !isMobile && (
                  <div className="mx-auto bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                )}
                
                {!isMobile && (
                  <button
                    onClick={toggleCollapse}
                    className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight
                      size={18}
                      className={`text-slate-400 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 py-6 px-3 overflow-y-auto scrollbar-hide">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActiveItem = isActive(item.url);
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.title}
                        onClick={() => navigate(item.url)}
                        className={`group w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-all
                                  ${isActiveItem 
                                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 font-medium border-l-2 border-blue-500" 
                                    : "text-slate-300 hover:bg-slate-800"}`}
                      >
                        <Icon size={isCollapsed && !isMobile ? 22 : 18} className={`${isActiveItem ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"} transition-colors`} />
                        
                        {/* Always show title text on mobile, respect collapsed state on desktop */}
                        {(!isCollapsed || isMobile) && (
                          <span className="ml-3 transition-opacity">{item.title}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* User Profile and Settings */}
              <div className={`mt-auto border-t border-slate-700 py-3 px-3`}>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center rounded-lg px-3 py-2 mb-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={isCollapsed && !isMobile ? 22 : 18} className="text-amber-400" />
                      {(!isCollapsed || isMobile) && <span className="ml-3">Light Mode</span>}
                    </>
                  ) : (
                    <>
                      <Moon size={isCollapsed && !isMobile ? 22 : 18} className="text-slate-400" />
                      {(!isCollapsed || isMobile) && <span className="ml-3">Dark Mode</span>}
                    </>
                  )}
                </button>
                
                {/* Profile Button */}
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center rounded-lg px-3 py-2 mb-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <UserCircle size={isCollapsed && !isMobile ? 22 : 18} className="text-slate-400" />
                  {(!isCollapsed || isMobile) && <span className="ml-3">Profile</span>}
                </button>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center rounded-lg px-3 py-2 mb-2 text-sm text-rose-300 hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut size={isCollapsed && !isMobile ? 22 : 18} className="text-rose-400" />
                  {(!isCollapsed || isMobile) && <span className="ml-3">Logout</span>}
                </button>
                
                {/* User Info */}
                {(!isCollapsed || isMobile) ? (
                  <div className="mt-3 px-3 py-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 rounded-md">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {userData.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {userData.name || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {userData.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center pt-3">
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {userData.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content wrapper for proper spacing */}
      <div className={`transition-all duration-300
                      ${isMobile ? "pl-0" : isCollapsed ? "pl-20" : "pl-64"}`}>
      </div>
    </>
  );
};

export default CustomSidebar;