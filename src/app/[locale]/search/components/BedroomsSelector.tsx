"use client";

import { useState } from "react";
import {
  Select,
  SelectItem,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@heroui/react";
import { Button } from "@heroui/react";

interface BedroomsSelectorProps {
  onBedroomsChange: (value: Set<string>) => void;
}

export function BedroomsSelector({ onBedroomsChange }: BedroomsSelectorProps) {
  const [selectedBedrooms, setSelectedBedrooms] = useState<Set<string>>(
    new Set([])
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newSelection = new Set(selectedBedrooms);
    if (newSelection.has(value)) {
      newSelection.delete(value);
    } else {
      newSelection.add(value);
    }
    setSelectedBedrooms(newSelection);
    onBedroomsChange(newSelection);
  };

  const options = [
    { key: "studio", label: "Studio" },
    { key: "1", label: "1" },
    { key: "2", label: "2" },
    { key: "3", label: "3" },
    { key: "4", label: "4+" }
  ];

  const displayValue = Array.from(selectedBedrooms)
    .map(bed =>
      bed === "studio" ? "Studio" : `${bed} bed${bed !== "1" ? "s" : ""}`
    )
    .join(", ");

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <Select
          label="Bedrooms"
          placeholder="Select bedrooms"
          selectedKeys={displayValue ? new Set([displayValue]) : new Set([])}
          className="w-full"
          disableSelectorIconRotation
          classNames={{
            trigger: "h-14",
            value: "text-default-500",
            base: "w-full",
            mainWrapper: "w-full"
          }}
          renderValue={() => (
            <div
              className={displayValue ? "text-default-700" : "text-default-500"}
            >
              {displayValue || "Select bedrooms"}
            </div>
          )}
        >
          <SelectItem key="hidden" className="hidden" />
        </Select>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            {options.map(option => (
              <Chip
                key={option.key}
                radius="sm"
                className="cursor-pointer h-11 px-4 text-sm"
                variant={
                  selectedBedrooms.has(option.key) ? "solid" : "bordered"
                }
                color={
                  selectedBedrooms.has(option.key) ? "secondary" : "default"
                }
                onClick={() => handleSelect(option.key)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="light"
              className="flex-1"
              onClick={() => {
                setSelectedBedrooms(new Set([]));
                onBedroomsChange(new Set([]));
                handleClose();
              }}
            >
              Cancel
            </Button>
            <Button color="secondary" className="flex-1" onClick={handleClose}>
              Select
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
