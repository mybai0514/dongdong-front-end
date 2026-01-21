"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      if (tempDate) {
        newDateTime.setHours(tempDate.getHours())
        newDateTime.setMinutes(tempDate.getMinutes())
      }
      setTempDate(newDateTime)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (time) {
      const [hours, minutes] = time.split(':')
      const newDateTime = tempDate ? new Date(tempDate) : new Date()
      newDateTime.setHours(parseInt(hours))
      newDateTime.setMinutes(parseInt(minutes))
      setTempDate(newDateTime)
    }
  }

  const handleConfirm = () => {
    setDate(tempDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempDate(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm", { locale: zhCN }) : <span>选择日期时间</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={handleDateSelect}
          locale={zhCN}
        />
        <div className="p-3 border-t space-y-3">
          <Input
            type="time"
            value={tempDate ? format(tempDate, "HH:mm") : ""}
            onChange={handleTimeChange}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              确认
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
