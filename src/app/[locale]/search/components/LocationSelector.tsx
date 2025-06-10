import { Select, SelectItem } from "@heroui/react";

interface LocationSelectorProps {
  selectedKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
}

export function LocationSelector({ selectedKeys, onSelectionChange }: LocationSelectorProps) {
  return (
    <Select
      label="Location"
      placeholder="Select location"
      className="w-full"
      classNames={{
        trigger: "h-14",
      }}
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => onSelectionChange(keys as Set<string>)}
    >
      <SelectItem key="phuket" textValue="Phuket">Phuket</SelectItem>
      <SelectItem key="bangkok" textValue="Bangkok">Bangkok</SelectItem>
      <SelectItem key="pattaya" textValue="Pattaya">Pattaya</SelectItem>
    </Select>
  );
} 