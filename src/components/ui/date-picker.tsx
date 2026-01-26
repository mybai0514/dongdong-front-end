"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ date, setDate, placeholder = "选择日期", disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)

  const handleConfirm = () => {
    setDate(tempDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempDate(date)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDate(undefined)
    setTempDate(undefined)
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: zhCN }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={setTempDate}
          locale={zhCN}
          initialFocus
        />
        <div className="p-3 border-t">
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
    {date && (
      <button
        onClick={handleClear}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
        type="button"
      >
        <X className="h-4 w-4 opacity-50 hover:opacity-100" />
      </button>
    )}
  </div>
  )
}
