import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import styles from "./SliderControl.module.css";

interface IControlProps extends React.HTMLAttributes<HTMLButtonElement> {
  direction: "prev" | "next";
}

const SliderControl = ({ direction, className, ...props }: IControlProps) => {
  return (
    <button className={`${styles.control} ${className}`} {...props}>
      <MdOutlineKeyboardArrowRight
        className={`${styles.controlIcon} ${
          direction === "prev" ? styles.prev : ""
        }`}
      />
    </button>
  );
};

export default SliderControl;
