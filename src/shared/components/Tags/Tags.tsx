import styles from "./Tags.module.css";

interface ITagsProps {
  tags: string[];
}

const Tags = ({ tags }: ITagsProps) => {
  return (
    <div className={`${styles.tags}`}>
      {tags.map(tag => (
        <div key={tag} className={`${styles.tag}`}>
          #<h3>{tag}</h3>
        </div>
      ))}
    </div>
  );
};

export default Tags;
