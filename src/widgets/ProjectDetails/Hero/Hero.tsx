"use client";

import BottomBar from "@/shared/refactoring/components/ProjectDetailsSlider/BottomBar/BottomBar";
import { IProps } from "@/shared/refactoring/components/ProjectDetailsSlider/interfaces";
import ProjectDetailsSlider from "@/shared/refactoring/components/ProjectDetailsSlider";
import styles from "./Hero.module.css";

const Hero = ({ data, bottomBar }: IProps) => {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroContent}>
        <ProjectDetailsSlider
          data={{
            project: {
              images: data.project.images,
              name: data.project.name,
              price: data.project.price,
              location: data.project.location,
              beach: {
                name: data.project.beach.name,
                distance: data.project.beach.distance
              }
            },
            developer: {
              id: data.developer.id,
              name: data.developer.name,
              image: data.developer.image
            }
          }}
        />

        <BottomBar data={bottomBar} />
      </div>
    </section>
  );
};

export default Hero;
