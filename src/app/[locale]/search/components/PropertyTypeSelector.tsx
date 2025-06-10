"use client";

import { useState } from "react";
import {
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@heroui/react";
import { Button } from "@heroui/react";

// SVG иконки как компоненты для лучшего контроля над стилями
const CondoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 21h18M5 21V3l14 3v15M9 9h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VillaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 21h18M6 21V8l6-4 6 4v13M4 8h16M10 12h4m-4 4h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.6667 5L7.50004 14.1667L3.33337 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface PropertyTypeSelectorProps {
  onPropertyTypeChange: (value: Set<string>) => void;
}

export function PropertyTypeSelector({
  onPropertyTypeChange
}: PropertyTypeSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set([]));
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      key: "condos",
      label: "Condos",
      icon: <CondoIcon className="w-8 h-8" />
    },
    {
      key: "villas",
      label: "Villas",
      icon: <VillaIcon className="w-8 h-8" />
    }
  ];

  const handleSelect = (value: string) => {
    const newSelection = new Set(selectedTypes);
    if (newSelection.has(value)) {
      newSelection.delete(value);
    } else {
      newSelection.add(value);
    }
    setSelectedTypes(newSelection);
    onPropertyTypeChange(newSelection);
  };

  const displayValue = Array.from(selectedTypes)
    .map(type => type.charAt(0).toUpperCase() + type.slice(1))
    .join(", ");

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <Select
          label="Property type"
          placeholder="Select property type"
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
              {displayValue || "Select property type"}
            </div>
          )}
        >
          <SelectItem key="hidden" className="hidden" />
        </Select>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {options.map(option => (
              <div
                key={option.key}
                onClick={() => handleSelect(option.key)}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${
                    selectedTypes.has(option.key)
                      ? "border-2 border-secondary bg-secondary/5"
                      : "border border-default-200 hover:border-secondary/50"
                  }
                `}
              >
                <div
                  className={`
                  ${selectedTypes.has(option.key) ? "text-secondary" : "text-default-500"}
                `}
                >
                  {option.icon}
                </div>
                <span className="mt-3 text-sm font-medium">{option.label}</span>
                {selectedTypes.has(option.key) && (
                  <div className="absolute top-3 right-3 text-secondary">
                    <CheckIcon />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="light"
              className="flex-1"
              onClick={() => {
                setSelectedTypes(new Set([]));
                onPropertyTypeChange(new Set([]));
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
