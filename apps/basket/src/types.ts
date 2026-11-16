export type BasketItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

export type BasketSummaryProps = {
  items: BasketItem[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};
