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
  minDate,
  maxDate,
}: {
  date: Date | null;
  setDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
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
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto p-0">
        <DialogHeader>
          <div style={{ width: "100%", height: "10px" }}></div>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(day) => {
            if (
              day &&
              (!minDate || day >= minDate) &&
              (!maxDate || day <= maxDate)
            ) {
              setDate(day);
            }
          }}
          disabled={(day) => {
            return (minDate && day < minDate) || (maxDate && day > maxDate) ? true : false;
          }}
          initialFocus
        />
      </DialogContent>
    </Dialog>
  );
}
