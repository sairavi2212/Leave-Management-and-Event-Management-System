import DropZone from "@/components/ui/drop-zone";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface UploadImageProps {
    children: React.ReactNode;
    onImageUpload?: (file: File) => void;
}

export default function UploadImage({ children, onImageUpload }: UploadImageProps) {
    const [open, setOpen] = useState(false);

    const handleFileSelect = (file: File) => {
        if (onImageUpload) {
            onImageUpload(file);
            setOpen(false); // Close dialog after upload
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogDescription>
                    <DropZone onFileSelect={handleFileSelect}/>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}