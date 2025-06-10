import { Developer, BottomBarData } from "./types";

export interface IProps {
  data: {
    developer: Developer;
    project: {
      images: {
        name: string;
        url: string;
        type?: "image" | "video";
        blurhash?: string;
      }[];
      name: string;
      price: string;
      location: string;
      beach: {
        name: string;
        distance: string;
      };
    };
  };
  bottomBar: BottomBarData;
}

export interface IProjectDetailsSliderProps extends Omit<IProps, "bottomBar"> {}

export interface IDeveloperBannerProps {
  developer: Developer;
}

export interface IBottomBarProps {
  data: BottomBarData;
}
