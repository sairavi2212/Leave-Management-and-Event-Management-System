import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function Email({
    Title,
    Email,
    Description,
}: {
    Title: string;
    Email: string;
    Description: string;
}) {
    const truncatedDescription =
        Description.length > 20
            ? `${Description.substring(0, 20)}...`
            : Description;

    return (
        <div
            style={{
                width: "100vw",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Card style={{ width: "70%" }}>
                <CardHeader>
                    <CardTitle>{Title}</CardTitle>
                    <div style={{ fontSize: "0.8rem", color: "gray" }}>
                        {Email}
                    </div>
                </CardHeader>
                <CardDescription>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <p style={{ padding: "1.5rem" }}>
                            {truncatedDescription}
                        </p>
                        <div style={{ padding: "1rem" }}>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div>
                                        <Button variant="secondary">Open</Button>
                                    </div>
                                </DialogTrigger>
                                <DialogContent style={{ height: "80vh", maxWidth: "60vw" }}>
                                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                        <DialogHeader style={{ minHeight: "10%", padding: "1rem" }}>
                                            <DialogTitle>{Title}</DialogTitle>
                                            <DialogDescription>
                                                {Email}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div style={{ padding: "1rem" }}>{Description}</div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardDescription>
                <CardFooter style={{ fontSize: "0.8rem" }}>
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "gray",
                            display: "flex",
                            justifyContent: "flex-end",
                            width: "100%",
                        }}
                    >
                        {Email}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}