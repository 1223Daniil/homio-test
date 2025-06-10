export interface PlaceResult {
  business_status: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  place_id: string;
  rating: number;
  types: string[];
  user_ratings_total: number;
  vicinity: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface PlacesResponse {
  results: PlaceResult[];
  status: string;
}
