"use client";

import { useState } from "react";
import {
  Select,
  Popover,
  PopoverTrigger,
  PopoverContent,
  SelectItem
} from "@heroui/react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Tabs, Tab } from "@heroui/react";

interface PriceRangeSelectorProps {
  onPriceRangeChange: (range: { min: number; max: number } | null) => void;
}

export function PriceRangeSelector({
  onPriceRangeChange
}: PriceRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("total");
  const [range, setRange] = useState({ min: "", max: "" });
  const [displayValue, setDisplayValue] = useState<string>("");

  const handleSelect = () => {
    if (range.min || range.max) {
      const minValue = range.min ? parseInt(range.min) : 0;
      const maxValue = range.max ? parseInt(range.max) : Infinity;
      onPriceRangeChange({ min: minValue, max: maxValue });

      setDisplayValue(
        `${range.min ? `${parseInt(range.min).toLocaleString()} ฿` : "0 ฿"} - ${
          range.max ? `${parseInt(range.max).toLocaleString()} ฿` : "Any"
        }`
      );
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setRange({ min: "", max: "" });
    setIsOpen(false);
    onPriceRangeChange(null);
    setDisplayValue("");
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <Select
          label="Price range"
          placeholder="Select price range"
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
              {displayValue || "Select price range"}
            </div>
          )}
        >
          <SelectItem key="hidden" className="hidden" textValue="hidden" />
        </Select>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="p-4">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={key => setSelectedTab(key.toString())}
            className="mb-4"
            aria-label="Price range tabs"
          >
            <Tab key="total" title="Total" />
            <Tab key="perM2" title="Per m²" />
          </Tabs>

          <div className="flex gap-2 mb-4">
            <Input
              type="number"
              placeholder="From"
              value={range.min}
              onChange={e =>
                setRange(prev => ({ ...prev, min: e.target.value }))
              }
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">฿</span>
                </div>
              }
              classNames={{
                input: "pl-6"
              }}
            />
            <Input
              type="number"
              placeholder="To"
              value={range.max}
              onChange={e =>
                setRange(prev => ({ ...prev, max: e.target.value }))
              }
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">฿</span>
                </div>
              }
              classNames={{
                input: "pl-6"
              }}
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="light" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button color="secondary" className="flex-1" onClick={handleSelect}>
              Select
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
