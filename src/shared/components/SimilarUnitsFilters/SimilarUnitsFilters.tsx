import { FieldValues, UseFormRegister } from "react-hook-form";
import { Select, SelectItem } from "@heroui/select";

import { SimilarUnitsFormValues } from "@/widgets/SimilarUnits/SimilarUnits";
import styles from "./SimilarUnitsFilters.module.css";

interface SimilarUnitsFiltersProps {
  register: UseFormRegister<SimilarUnitsFormValues>;
}

const SimilarUnitsFilters = ({ register }: SimilarUnitsFiltersProps) => {
  return (
    <div className={`${styles.similarUnitsFilters}`}>
      <div className={`${styles.col}`}>
        <Select
          isVirtualized
          radius={"sm"}
          label="Bedrooms"
          {...register("bedrooms")}
        >
          <SelectItem>1</SelectItem>
          <SelectItem>2</SelectItem>
          <SelectItem>3</SelectItem>
          <SelectItem>4</SelectItem>
          <SelectItem>5</SelectItem>
        </Select>
        <Select
          isVirtualized
          radius={"sm"}
          label="Price"
          {...register("price")}
        >
          <SelectItem>1</SelectItem>
          <SelectItem>2</SelectItem>
          <SelectItem>3</SelectItem>
          <SelectItem>4</SelectItem>
          <SelectItem>5</SelectItem>
        </Select>
      </div>

      <div className={`${styles.col}`}>
        <Select
          isVirtualized
          radius={"sm"}
          label="Total Area"
          {...register("totalArea")}
        >
          <SelectItem>1</SelectItem>
          <SelectItem>2</SelectItem>
          <SelectItem>3</SelectItem>
          <SelectItem>4</SelectItem>
          <SelectItem>5</SelectItem>
        </Select>
        <Select
          isVirtualized
          radius={"sm"}
          label="Off date"
          {...register("offDate")}
        >
          <SelectItem>1</SelectItem>
          <SelectItem>2</SelectItem>
          <SelectItem>3</SelectItem>
          <SelectItem>4</SelectItem>
          <SelectItem>5</SelectItem>
        </Select>
      </div>
    </div>
  );
};

export default SimilarUnitsFilters;
