export type ProductRating = {
  rate: number;
  count: number;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
};

export type BasketItem = Pick<Product, 'id' | 'title' | 'price' | 'image'> & {
  quantity: number;
};

export type ProductCatalogRemoteProps = {
  onAddToBasket: (product: Product) => void;
};

export type BasketRemoteProps = {
  items: BasketItem[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};
