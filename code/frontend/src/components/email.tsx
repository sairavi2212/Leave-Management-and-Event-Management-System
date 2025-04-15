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
import { CalendarIcon } from "lucide-react";

export default function Email({
    Title,
    Email,
    Description,
    Image,
}: {
    Title: string;
    Email: string;
    Description: string;
    Image: string;
}) {
    const [imageError, setImageError] = useState(false);
    
    // Format the image URL correctly based on the path format
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        
        // If it's already a full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it's a path starting with /uploads, prepend the API base URL
        if (imagePath.startsWith('/uploads')) {
            // Get API URL from environment or use default
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            return `${apiBaseUrl}${imagePath}`;
        }
        
        // Return the path as is if it doesn't match any of the above cases
        return imagePath;
    };
    
    const handleImageError = () => {
        console.error("Failed to load image:", Image);
        setImageError(true);
    };

    const truncatedDescription =
        Description.length > 100
            ? `${Description.substring(0, 100)}...`
            : Description;

    return (
        <Card className="w-full h-full mx-auto flex flex-col">
            <CardHeader className="flex-none">
                <CardTitle className="text-lg md:text-xl line-clamp-2">{Title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{Email}</span>
                </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
                <p className="text-sm md:text-base mb-3 line-clamp-3">{truncatedDescription}</p>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">Read More</Button>
                    </DialogTrigger>
                    <DialogContent className="h-[85vh] md:h-[80vh] w-[95vw] max-w-4xl">
                        <div className="flex flex-col h-full">
                            <DialogHeader className="min-h-[10%] pb-4 border-b">
                                <DialogTitle className="text-xl md:text-2xl">{Title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-1 text-muted-foreground">
                                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                    {Email}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-4 md:py-6 flex flex-col gap-6 overflow-auto flex-1">
                                <div className="whitespace-pre-line text-sm md:text-base">{Description}</div>
                                
                                {Image && !imageError ? (
                                    <div className="w-full text-center">
                                        <img 
                                            src={getImageUrl(Image)} 
                                            alt="Event attachment" 
                                            className="max-w-full max-h-[40vh] md:max-h-[50vh] object-contain mx-auto rounded-md" 
                                            onError={handleImageError}
                                        />
                                    </div>
                                ) : Image ? (
                                    <div className="text-center text-muted-foreground p-4 border border-dashed border-gray-300 rounded-md">
                                        Unable to load image
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
            
            <CardFooter className="border-t pt-3 text-sm text-muted-foreground flex justify-end flex-none">
                {new Date().toLocaleDateString()}
            </CardFooter>
        </Card>
    );
}