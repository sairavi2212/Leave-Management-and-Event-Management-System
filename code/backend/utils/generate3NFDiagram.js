/**
 * Generate 3NF Database Diagram
 * 
 * This utility generates a 3NF (Third Normal Form) diagram of the database schema
 * based on the Mongoose models. It uses Mermaid.js syntax which can be rendered
 * in various Markdown viewers and documentation tools.
 */

import fs from 'fs';
import path from 'path';

// Import all models
import User from '../models/users.js';
import Project from '../models/projects.js';
import Leave from '../models/leaves.js';
import Event from '../models/events.js';
import Location from '../models/location.js';
import ResetToken from '../models/resettoken.js';

// Define the relationships between models for 3NF representation
const relationships = [
  // User relationships
  { from: 'User', to: 'Location', type: 'references', label: 'is located at' },
  { from: 'User', to: 'UserProject', type: 'has many', label: 'assigned to' },
  { from: 'User', to: 'UserHierarchy', type: 'has many', label: 'manages/reports to' },
  { from: 'User', to: 'Leave', type: 'submits', label: 'requests' },
  { from: 'User', to: 'Leave', type: 'approves', label: 'approves/rejects' },
  { from: 'User', to: 'Comment', type: 'writes', label: 'authors' },
  
  // Project relationships
  { from: 'Project', to: 'UserProject', type: 'has many', label: 'has member' },
  { from: 'Project', to: 'EventProject', type: 'referenced by', label: 'associated with' },
  
  // Event relationships
  { from: 'Event', to: 'Comment', type: 'has many', label: 'contains' },
  { from: 'Event', to: 'EventLocation', type: 'has many', label: 'located at' },
  { from: 'Event', to: 'EventProject', type: 'has many', label: 'related to' },
  
  // Comment relationships
  { from: 'Comment', to: 'Reply', type: 'has many', label: 'receives' },
  
  // Junction tables and their relationships
  { from: 'UserProject', to: 'User', type: 'belongs to', label: 'member' },
  { from: 'UserProject', to: 'Project', type: 'belongs to', label: 'project' },
  { from: 'EventLocation', to: 'Event', type: 'belongs to', label: 'event' },
  { from: 'EventLocation', to: 'Location', type: 'belongs to', label: 'location' },
  { from: 'EventProject', to: 'Event', type: 'belongs to', label: 'event' },
  { from: 'EventProject', to: 'Project', type: 'belongs to', label: 'project' },
  { from: 'UserHierarchy', to: 'User', type: 'references', label: 'user/manager' },
  { from: 'Reply', to: 'Comment', type: 'belongs to', label: 'parent comment' },
  { from: 'Reply', to: 'User', type: 'belongs to', label: 'author' },
];

// Define the entities with their attributes for 3NF
const entities = [
  {
    name: 'User',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'name', type: 'String' },
      { name: 'email', type: 'String' },
      { name: 'password', type: 'String' },
      { name: 'role', type: 'String' },
      { name: 'createdAt', type: 'Date' },
      { name: 'age', type: 'Number' },
      { name: 'contact', type: 'Number' },
      { name: 'location', type: 'ObjectId', isFK: true, references: 'Location' },
    ]
  },
  {
    name: 'Project',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'startDate', type: 'Date' },
      { name: 'endDate', type: 'Date' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'Location',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'city', type: 'String' },
    ]
  },
  {
    name: 'Leave',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'leaveType', type: 'String' },
      { name: 'startDate', type: 'Date' },
      { name: 'endDate', type: 'Date' },
      { name: 'reason', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'submittedAt', type: 'Date' },
      { name: 'approvedBy', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'approvedAt', type: 'Date' },
      { name: 'comments', type: 'String' },
      { name: 'approved_comments', type: 'String' },
      { name: 'isNotificationRead', type: 'Boolean' },
    ]
  },
  {
    name: 'Event',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'title', type: 'String' },
      { name: 'description', type: 'String' },
      { name: 'start', type: 'Date' },
      { name: 'end', type: 'Date' },
      { name: 'createdAt', type: 'Date' },
      { name: 'selected_dropdown', type: 'String' },
      { name: 'image_path', type: 'String' },
    ]
  },
  {
    name: 'Comment',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'eventId', type: 'ObjectId', isFK: true, references: 'Event' },
      { name: 'text', type: 'String' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'Reply',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'commentId', type: 'ObjectId', isFK: true, references: 'Comment' },
      { name: 'text', type: 'String' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'UserProject',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'projectId', type: 'ObjectId', isFK: true, references: 'Project' },
      { name: 'role', type: 'String' },
    ]
  },
  {
    name: 'UserHierarchy',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'managerId', type: 'ObjectId', isFK: true, references: 'User' },
    ]
  },
  {
    name: 'EventLocation',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'eventId', type: 'ObjectId', isFK: true, references: 'Event' },
      { name: 'locationId', type: 'ObjectId', isFK: true, references: 'Location' },
    ]
  },
  {
    name: 'EventProject',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'eventId', type: 'ObjectId', isFK: true, references: 'Event' },
      { name: 'projectId', type: 'ObjectId', isFK: true, references: 'Project' },
    ]
  },
  {
    name: 'ResetToken',
    attributes: [
      { name: '_id', type: 'ObjectId', isPK: true },
      { name: 'userId', type: 'ObjectId', isFK: true, references: 'User' },
      { name: 'token', type: 'String' },
      { name: 'createdAt', type: 'Date' },
      { name: 'expiresAt', type: 'Date' },
    ]
  },
];

// Generate Mermaid ER Diagram code
function generateMermaidERD() {
  let mermaidCode = 'erDiagram\n';
  
  // Add entities with attributes
  entities.forEach(entity => {
    let entityDefinition = `    ${entity.name} {\n`;
    
    // Add attributes
    entity.attributes.forEach(attr => {
      const marker = attr.isPK ? 'PK' : attr.isFK ? 'FK' : '';
      entityDefinition += `        ${attr.type} ${attr.name} ${marker}\n`;
    });
    
    entityDefinition += '    }\n';
    mermaidCode += entityDefinition;
  });
  
  // Add relationships
  relationships.forEach(rel => {
    mermaidCode += `    ${rel.from} ${getRelationshipCardinality(rel.type)} ${rel.to} : "${rel.label}"\n`;
  });
  
  return mermaidCode;
}

// Helper to determine relationship cardinality for Mermaid
function getRelationshipCardinality(relationType) {
  switch (relationType) {
    case 'has many':
      return '||--o{';
    case 'belongs to':
      return '}|--||';
    case 'references':
      return '}|--||';
    case 'submits':
      return '||--o{';
    case 'approves':
      return '||--o{';
    case 'writes':
      return '||--o{';
    case 'referenced by':
      return '}o--||';
    default:
      return '||--o|';
  }
}

// Generate an HTML file with the Mermaid diagram
function generateHtmlWithMermaid() {
  const mermaidDiagram = generateMermaidERD();
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>3NF Database Diagram - Team 5 Project</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      text-align: center;
    }
    .mermaid {
      display: flex;
      justify-content: center;
      margin-top: 30px;
      overflow: auto;
    }
    .description {
      margin-top: 30px;
      padding: 15px;
      background-color: #f0f7ff;
      border-left: 4px solid #0066cc;
      border-radius: 4px;
    }
    .legend {
      margin-top: 20px;
      padding: 10px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .legend ul {
      list-style-type: none;
      padding-left: 10px;
    }
    .legend li {
      margin: 5px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>3NF Database Diagram - Eklavya Project</h1>

    
    <div class="legend">
      <h3>Legend</h3>
      <ul>
        <li><strong>PK</strong> - Primary Key</li>
        <li><strong>FK</strong> - Foreign Key</li>
        <li><strong>||--o{</strong> - One-to-Many relationship</li>
        <li><strong>}|--||</strong> - Many-to-One relationship</li>
        <li><strong>}|--|{</strong> - Many-to-Many relationship</li>
      </ul>
    </div>
    
    <div class="mermaid">
${mermaidDiagram}
    </div>
    
    <div class="footer">
      <p>Generated on ${new Date().toLocaleDateString()} - Team 5 DASS Project</p>
    </div>
  </div>
  
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      er: {
        diagramPadding: 20,
        layoutDirection: 'TB',
        minEntityWidth: 100,
        minEntityHeight: 75,
        entityPadding: 15,
        stroke: 'gray',
        fill: 'honeydew',
        fontSize: 12,
      },
      themeCSS: '.relationshipLine{stroke-width:1.2px;}'
    });
  </script>
</body>
</html>
`;

  // Write the HTML file
  fs.writeFileSync(path.resolve(process.cwd(), '3nf-diagram.html'), htmlContent);
  
  console.log('3NF diagram generated successfully! Open 3nf-diagram.html in a browser to view it.');
  return 'Generated 3NF diagram at: ' + path.resolve(process.cwd(), '3nf-diagram.html');
}

// Main execution
function main() {
  try {
    const result = generateHtmlWithMermaid();
    return { success: true, message: result };
  } catch (error) {
    console.error('Error generating 3NF diagram:', error);
    return { success: false, message: error.message };
  }
}

// Run if this script is executed directly (ES modules version)
// In ES modules, we use import.meta.url to check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(main());
}

export default main;