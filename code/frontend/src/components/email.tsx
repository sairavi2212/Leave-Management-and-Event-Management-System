import { useState } from "react";
import {
    Card,
    CardContent,
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
import { CalendarIcon, MapPinIcon, FolderIcon, ClockIcon, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventComments from "@/components/event-comments";

export default function Email({
    Title,
    Email,
    Description,
    Image,
    CreatedAt,
    StartDate,
    EndDate,
    Category,
    Locations,
    Projects,
    eventId
}: {
    Title: string;
    Email: string;
    Description: string;
    Image: string;
    CreatedAt?: string | Date;
    StartDate?: string | Date;
    EndDate?: string | Date;
    Category?: string;
    Locations?: string[];
    Projects?: string[];
    eventId?: string;
}) {
    const [imageError, setImageError] = useState(false);
    
    // Format the image URL correctly based on the path format
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        
        // If it's already a full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Ensure path starts with /uploads for consistency
        const normalizedPath = imagePath.startsWith('/uploads') 
            ? imagePath 
            : `/uploads/${imagePath.replace('uploads/', '')}`;
            
        // Get API URL from environment or use default
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiBaseUrl}${normalizedPath}`;
    };
    
    const handleImageError = () => {
        console.error("Failed to load image:", Image);
        setImageError(true);
    };

    // Format the date to display
    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '';
        
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString();
    };

    // Format date with time
    const formatDateTime = (dateString?: string | Date) => {
        if (!dateString) return '';
        
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleString();
    };

    const truncatedDescription =
        Description.length > 100
            ? `${Description.substring(0, 100)}...`
            : Description;

    return (
        <Card className="w-full h-full mx-auto flex flex-col border-0 !border-none shadow dark:shadow-gray-900/30">
            <CardHeader className="flex-none">
                <CardTitle className="text-lg md:text-xl line-clamp-2">{Title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{Email}</span>
                </CardDescription>
                {Category && (
                    <Badge variant="outline" className="mt-1">
                        {Category}
                    </Badge>
                )}
            </CardHeader>
            
            <CardContent className="flex-grow">
                <p className="text-sm md:text-base mb-3 line-clamp-3">{truncatedDescription}</p>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">Read More</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden">
                        <div className="flex flex-col h-[80vh]">
                            {/* Header - Fixed */}
                            <DialogHeader className="px-6 py-4 border-b bg-card sticky top-0 z-10">
                                <DialogTitle className="text-xl md:text-2xl">{Title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-1 mt-1">
                                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                    {Email}
                                </DialogDescription>
                                
                                {/* Metadata badges */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {Category && (
                                        <Badge className="flex items-center gap-1">
                                            <FolderIcon className="h-3.5 w-3.5" />
                                            {Category}
                                        </Badge>
                                    )}
                                    
                                    {StartDate && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <ClockIcon className="h-3.5 w-3.5" />
                                            {formatDateTime(StartDate)}
                                            {EndDate && ` - ${formatDateTime(EndDate)}`}
                                        </Badge>
                                    )}
                                    
                                    {Locations && Locations.length > 0 && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <MapPinIcon className="h-3.5 w-3.5" />
                                            {Locations.join(', ')}
                                        </Badge>
                                    )}
                                </div>
                            </DialogHeader>
                            
                            {/* Tabs and Content */}
                            <div className="flex-1 overflow-hidden">
                                <Tabs defaultValue="details" className="h-full">
                                    <div className="border-b bg-muted/30 sticky top-0 z-10">
                                        <TabsList className="mx-6 -mb-px">
                                            <TabsTrigger className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary" value="details">Details</TabsTrigger>
                                            <TabsTrigger className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary" value="comments">Comments</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    
                                    <div className="overflow-y-auto h-[calc(80vh-170px)]">
                                        <TabsContent value="details" className="mt-0 p-0 border-none">
                                            <div className="p-6">
                                                <div className="whitespace-pre-line text-sm md:text-base leading-relaxed">
                                                    {Description}
                                                </div>
                                                
                                                {/* Projects section */}
                                                {Projects && Projects.length > 0 && (
                                                    <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                                                        <h4 className="text-sm font-medium mb-3 flex items-center">
                                                            <FolderIcon className="h-4 w-4 mr-2 text-primary" />
                                                            Related Projects
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Projects.map((project, index) => (
                                                                <Badge key={index} variant="secondary">
                                                                    {project}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Image section */}
                                                {Image && !imageError ? (
                                                    <div className="mt-6 mb-4">
                                                        <div className="rounded-lg overflow-hidden border shadow-sm bg-background">
                                                            <img 
                                                                src={getImageUrl(Image)} 
                                                                alt="Event attachment" 
                                                                className="max-w-full max-h-[50vh] object-contain mx-auto" 
                                                                onError={handleImageError}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2 text-center">Event attachment</p>
                                                    </div>
                                                ) : Image ? (
                                                    <div className="mt-6 p-6 border rounded-lg text-center text-muted-foreground">
                                                        <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                        <p>Unable to load image</p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="comments" className="mt-0 p-0 border-none">
                                            <div className="p-6">
                                                {eventId ? (
                                                    <EventComments eventId={eventId} />
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                        <p className="text-lg font-medium">Comments are not available</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            This event doesn't support comments
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
            
            <CardFooter className="border-t pt-3 text-sm text-muted-foreground flex justify-between flex-none border-muted/20">
                <span className="flex items-center gap-1 text-xs">
                    <ClockIcon className="h-3 w-3" />
                    {StartDate && formatDate(StartDate)}
                </span>
                <span>{formatDate(CreatedAt)}</span>
            </CardFooter>
        </Card>
    );
}