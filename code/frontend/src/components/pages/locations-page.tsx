import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import CustomSidebar from "@/components/CustomSidebar";
import CustomHeader from "@/components/CustomHeader";

export default function LocationsPage() {
  const [userRole, setUserRole] = useState<string>("");
  const [state, setState] = useState<"loading" | "loaded">("loading");
  const [locations, setLocations] = useState<{ _id: string; city: string }[]>([]);
  const [newCity, setNewCity] = useState<string>("");
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const navigate = useNavigate();

  // 1) Fetch the user's role
  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(res.data.role);
    } catch {
      // if we can’t verify, bounce to login
      navigate("/login", { replace: true });
    } finally {
      setState("loaded");
    }
  };

  // 2) Load locations
  const fetchLocations = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get("http://localhost:5000/api/locations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // 3) Add or delete
  const addLocation = async () => {
    if (!newCity.trim()) return;
    await axios.post(
      "http://localhost:5000/api/locations",
      { city: newCity },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setNewCity("");
    fetchLocations();
  };
  const removeLocation = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/locations/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchLocations();
  };

  // Kick off role check on mount
  useEffect(() => {
    checkUserRole();
  }, []);

  // Once we know the role, either load data or redirect away
  useEffect(() => {
    if (state === "loaded") {
      if (userRole === "superadmin" || userRole === "admin") {
        fetchLocations();
      } else {
        // Not a superadmin? Send them home
        navigate("/home", { replace: true });
      }
    }
  }, [state, userRole, navigate]);

  // Loading UI
  if (state === "loading") {
    return (
      <ThemeProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <CustomSidebar />
          <div className="flex-1 overflow-hidden">
            <CustomHeader title="Locations" />
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // ————— Only superadmin reaches here —————
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <CustomSidebar />
        <div className="flex-1 overflow-hidden">
          <CustomHeader title="Locations" />
          <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
            <motion.div
              className="container mx-auto py-6 px-4 md:px-6 lg:px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Heading */}
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
              </div>

              {/* Add-new form */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Location</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Input
                    placeholder="City name"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                  <Button onClick={addLocation}>Add</Button>
                </CardContent>
              </Card>

              {/* List */}
              {loadingData ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {locations.map((loc) => (
                        <li
                          key={loc._id}
                          className="flex justify-between items-center"
                        >
                          <span>{loc.city}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeLocation(loc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
