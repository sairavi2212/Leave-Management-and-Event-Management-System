import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { CalendarIcon, Send } from "lucide-react";
import axios from "axios";

interface CreateProjectDialogProps {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export default function CreateProjectDialog({
  onClose,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<string>("ongoing");
  const [users, setUsers] = useState<string>("");
  const [manager, setManager] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitProject = () => {
    if (!name || !description || !status) {
      alert("Please fill in Name, Description, and Status");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    // Prepare project payload. For users and manager, split comma separated values.
    const projectPayload = {
      name,
      description,
      status,
      users: users.split(",").map((u) => u.trim()),
      manager: manager.split(",").map((m) => m.trim()),
      startDate,
      endDate,
    };

    axios
      .post("http://localhost:5000/api/projects", projectPayload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data);
        alert("Project created successfully!");
        onProjectCreated(response.data);
        onClose();
      })
      .catch((error) => {
        console.error("Error creating project!", error);
        alert(
          "Error creating project: " +
            (error.response?.data?.message || "Unknown error")
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md">
          <CalendarIcon className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <CardDescription>Project Name</CardDescription>
                <Input
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <CardDescription>Project Description</CardDescription>
                <Textarea
                  placeholder="Enter project details and description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <CardDescription>Status</CardDescription>
                <Input
                  type="text"
                  placeholder="Enter project status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <CardDescription>Users (comma separated)</CardDescription>
                <Input
                  type="text"
                  placeholder="e.g., user1, user2"
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <CardDescription>Manager(s) (comma separated)</CardDescription>
                <Input
                  type="text"
                  placeholder="e.g., manager1, manager2"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <CardDescription>Start Date</CardDescription>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="space-y-2">
                  <CardDescription>End Date</CardDescription>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardFooter className="px-0 pb-0">
            <Button
              onClick={submitProject}
              disabled={isLoading}
              className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
