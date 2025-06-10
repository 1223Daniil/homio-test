export interface AreaRating {
  title: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  description: string;
}

export interface InfrastructureMapProps {
  latitude: number;
  longitude: number;
  address: string;
}
