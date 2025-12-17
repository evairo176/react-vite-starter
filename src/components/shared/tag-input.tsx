import React, { useState, type ChangeEvent, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TagsInputProps {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
}

export const TagsInput = ({
    value,
    onChange,
    placeholder = "Press Enter to add tag",
}: TagsInputProps) => {
    const [inputValue, setInputValue] = React.useState("")

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value.toUpperCase())
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault()

            const newTag = inputValue.trim().toUpperCase()

            if (!value.includes(newTag)) {
                onChange([...value, newTag])
            }

            setInputValue("")
        }

        if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-wrap gap-2 rounded-md border border-border p-2">
            {value.map((tag, index) => (
                <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                >
                    {tag}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => removeTag(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}

            <Input
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 min-w-[120px] border-none shadow-none focus-visible:ring-0 uppercase"
            />
        </div>
    )
}
