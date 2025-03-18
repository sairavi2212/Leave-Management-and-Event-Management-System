import Layout from "@/components/layout.tsx";
import CreateProjectDialog from "@/components/create-project-dialog"; // Import the dialog component
import { useState, useEffect } from "react";
import axios from "axios";


export default function ProjectsPage() {
  const [superUser, setSuperUser] = useState("");
  const [state, setState] = useState("loading");
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Check the current user profile and role
  const checkSuperUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSuperUser(response.data.role);
        console.log(
          `User ${response.data.firstName} ${response.data.lastName} found with role ${response.data.role}`
        );
        setState("loaded");
      })
      .catch((error) => {
        console.error("There was an error fetching the user!", error);
      });
  };

  useEffect(() => {
    checkSuperUser();
  }, []);

  // Once the user data is loaded, fetch projects from the backend
  useEffect(() => {
    if (state === "loaded") {
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/projects", {  // Updated endpoint here
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("Projects fetched:", response.data);
          setProjects(response.data);
        })
        .catch((error) => {
          console.error("Error fetching projects", error);
        });
    }
  }, [state]);

  // Handler when a new project is created successfully
  const handleProjectCreated = (newProject: any) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  return (
    <>
      {state === "loaded" && (
        <Layout>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Header Area */}
            <div
              style={{
                width: "70vw",
                height: "10vh",
                display: "flex",
                justifyContent: "right",
              }}
            >
              {superUser === "admin" && (
                <button onClick={() => setShowCreateDialog(true)}>Create Project</button>
              )}
            </div>

            {/* Projects List */}
            <div className="project-list" style={{ width: "70vw" }}>
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="project-card"
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p>
                    Start Date:{" "}
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    End Date:{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {showCreateDialog && (
            <CreateProjectDialog
              onClose={() => setShowCreateDialog(false)}
              onProjectCreated={handleProjectCreated}
            />
          )}
        </Layout>
      )}
    </>
  );
}
