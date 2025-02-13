import User from "../models/users.js";
import Event from "../models/events.js";
import Project from "../models/projects.js";
import connectDb from "../server.js";

connectDb();

// Add one element to the User collection
const addUser = async (userData) => {
    try {
        const user = new User(userData);
        await user.save();
        console.log('User added successfully:', user);
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

// Example usage
const newUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "securepassword",
    role: "user",
    age: 30,
    project: ["Project1", "Project2"],
    parent_role: ["ParentRole1"],
    contact: 1234567890
};

addUser(newUser);


const addProject = async (projectData) => {
    try {
        const project = new Project(projectData);
        await project.save();
        console.log('Project added successfully:', project);
    } catch (error) {
        console.error('Error adding project:', error);
    }
};

// Example usage
const newProject = {
    name: "Project Alpha",
    description: "This is a sample project.",
    status: "ongoing",
    users: ["User1", "User2"],
    manager: ["Manager1"],
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-12-31")
};

addProject(newProject);


const addEvent = async (eventData) => {
    try {
        const event = new Event(eventData);
        await event.save();
        console.log('Event added successfully:', event);
    } catch (error) {
        console.error('Error adding event:', error);
    }
};

// Example usage
const newEvent = {
    title: "Sample Event",
    description: "This is a sample event.",
    start: new Date("2023-11-01T10:00:00"),
    end: new Date("2023-11-01T12:00:00"),
    comments: ["Comment1", "Comment2"],
    selected_dropdown: "Option1",
    image_blob: "image_data_here",
    locations: ["Location1", "Location2"],
    projects: ["Project1", "Project2"]
};

addEvent(newEvent);

