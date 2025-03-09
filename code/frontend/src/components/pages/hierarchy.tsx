import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Layout from "@/components/layout";

interface Role {
    _id: string;
    role: string;
    parentRole: string | null;
    childRole: string | null;
    level: number;
}

const HierarchyTree: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newRole, setNewRole] = useState({
        role: '',
        parentRole: '',
        childRole: '',
        level: 0
    });

    const fetchRoles = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/roles/hierarchy', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.role === 'admin');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        };

        fetchRoles();
        checkAdmin();
    }, []);

    const addRole = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/roles/hierarchy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRole)
            });
            if (response.ok) {
                await fetchRoles();
                setNewRole({
                    role: '',
                    parentRole: '',
                    childRole: '',
                    level: 0
                });
            }
        } catch (error) {
            console.error('Error adding role:', error);
        }
    };

    const renderRoleTree = (roles: Role[], parentRole: string | null = null, level = 0) => {
        const children = roles.filter(role => role.parentRole === parentRole);
        
        if (children.length === 0) return null;

        return (
            <ul className="ml-8 list-disc">
                {children.map(role => (
                    <li key={role._id} className="my-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{role.role}</span>
                            <span className="text-sm text-muted-foreground">Level: {role.level}</span>
                        </div>
                        {renderRoleTree(roles, role.role, level + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Role Hierarchy</h2>
                    {!isAdmin && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Add Role</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Role</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Role Name"
                                        value={newRole.role}
                                        onChange={(e) => setNewRole({...newRole, role: e.target.value})}
                                    />
                                    <Select
                                        value={newRole.parentRole}
                                        onValueChange={(value) => setNewRole({...newRole, parentRole: value})}
                                    >
                                        <option value="">Select Parent Role</option>
                                        {roles.map(role => (
                                            <option key={role._id} value={role.role}>{role.role}</option>
                                        ))}
                                    </Select>
                                    <Select
                                        value={newRole.childRole}
                                        onValueChange={(value) => setNewRole({...newRole, childRole: value})}
                                    >
                                        <option value="">Select Child Role</option>
                                        {roles.map(role => (
                                            <option key={role._id} value={role.role}>{role.role}</option>
                                        ))}
                                    </Select>
                                    <Input
                                        type="number"
                                        placeholder="Level"
                                        value={newRole.level}
                                        onChange={(e) => setNewRole({...newRole, level: parseInt(e.target.value)})}
                                    />
                                    <Button onClick={addRole}>Add Role</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <div className="border rounded-lg p-4">
                    {renderRoleTree(roles)}
                </div>
            </div>
        </Layout>
    );
};

export default HierarchyTree;