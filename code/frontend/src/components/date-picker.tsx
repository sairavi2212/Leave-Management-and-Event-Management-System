import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DatePicker({
  date, 
  setDate,
  minDate
}: {
  date: Date, 
  setDate: (date: Date) => void,
  minDate?: Date
}) {
  // Use current date as default minimum date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison
  
  // Use provided minDate or today, whichever is later
  const effectiveMinDate = minDate && minDate > today ? minDate : today;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto p-0">
        <DialogHeader>
          <div style={{ width: "100%", height: "10px" }}></div>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => day && setDate(day)}
          disabled={(date) => date < effectiveMinDate}
          initialFocus
        />
      </DialogContent>
    </Dialog>
  );
}
