export interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export type SoldItems = Record<number, { name: string; count: number }>;

export interface SalesData {
  totalRevenue: number;
}

export type View = 'pos' | 'report';