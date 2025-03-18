import Project from "../models/projects.js";
import connectDb from "../server.js";

connectDb();

// Function to add a new project
export const addProject = async (projectData) => {
  try {
    const project = new Project(projectData);
    await project.save();
    console.log("Project added successfully:", project);
  } catch (error) {
    console.error("Error adding project:", error);
  }
};

// Function to fetch all projects from the database
export const getAllProjects = async () => {
  try {
    const projects = await Project.find();
    console.log("Projects fetched successfully:", projects);
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

// Function to update an existing project by its ID
export const updateProject = async (projectId, updateData) => {
  try {
    const project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
    });
    console.log("Project updated successfully:", project);
    return project;
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

// Function to delete a project by its ID
export const deleteProject = async (projectId) => {
  try {
    await Project.findByIdAndDelete(projectId);
    console.log("Project deleted successfully:", projectId);
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

// Example usage:

const newProject = {
  name: "Project Alpha",
  description: "This is a sample project.",
  status: "ongoing",
  users: ["User1", "User2"],
  manager: ["Manager1"],
  startDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-31"),
};

// Add a sample project to test the function
addProject(newProject);
