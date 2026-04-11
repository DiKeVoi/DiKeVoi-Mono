import { ImageSourcePropType } from "react-native";

export type OnboardingData = {
  id: number;
  title: string;
  description: string;
  detail?: string; // Optional field for additional details
  image: ImageSourcePropType;
};
