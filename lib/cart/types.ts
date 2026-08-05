/** Cart line shape, shared between the client store and server actions. */
export type CartLineData = {
  productSlug: string;
  productName: string;
  sku: string;
  variantId: string | null;
  variantName: string | null;
  imageUrl: string;
  unitPricePence: number;
  packQuantity: number;
  moq: number;
  quantity: number;
};
