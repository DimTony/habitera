/** Minimal offline snapshot — full listings stay on the server. */
export type BookmarkSnapshot = {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  imageUrl?: string | null;
};
