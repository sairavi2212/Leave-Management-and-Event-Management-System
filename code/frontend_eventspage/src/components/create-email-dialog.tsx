import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

var Branches = ["Hoshangabad", "Lucknow", "Asgard", "TVA", "Arkham City"];
var Teams = ["Tech Team", "Marketing Team", "Sales Team", "HR Team", "Finance Team"];

export default function CreateEmail() {
    const [selectedBranch, setSelectedBranch] = useState("Branch");
    const [selectedTeam, setSelectedTeam] = useState("Team");

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline">Create Email</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogDescription>
                    <Card>
                        <CardHeader>
                            <div style={{ display: "flex", width: "100%", justifyContent: "left" }}>
                                <div style={{ paddingRight: "1rem" }}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="outline">{selectedBranch}</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {Branches.map((branch) => (
                                                <DropdownMenuItem key={branch} onSelect={() => setSelectedBranch(branch)}>
                                                    {branch}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div style={{ paddingRight: "1rem" }}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="outline">{selectedTeam}</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Select Team</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {Teams.map((team) => (
                                                <DropdownMenuItem key={team} onSelect={() => setSelectedTeam(team)}>
                                                    {team}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardDescription>Event Title</CardDescription>
                            <Input type="email" placeholder="Title" />
                            <CardDescription>
                                Event Description
                                <Textarea placeholder="Content"></Textarea>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    width: "100%",
                                }}
                            >
                                <Button variant="secondary">Send</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}