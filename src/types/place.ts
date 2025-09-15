export interface LocalizedText {
  text?: string;
  languageCode?: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Place {
  id?: string;
  name?: string; // places/PLACE_ID
  displayName?: LocalizedText;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: LatLng;
  primaryType?: string;
  primaryTypeDisplayName?: LocalizedText;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  editorialSummary?: LocalizedText;
}
