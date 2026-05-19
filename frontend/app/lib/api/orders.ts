import { http } from "./http";

const ORDER_API_BASE_URL = "/api/v1/orders";

/** 백엔드 `Order` 엔티티 JSON (요약 필드 위주) */
export interface OrderItemRow {
  id: number;
  quantity: number;
  price: number;
  product?: { id: number; name?: string };
  design?: { id: number };
}

export interface Order {
  id: number;
  quantity: number;
  totalPrice: number;
  status?: string;
  createTime?: string;
  updateTime?: string;
  items?: OrderItemRow[];
  shippingReceiver?: string;
  shippingPhone?: string;
  shippingZipCode?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddress?: string;
  personalizationNote?: string;
}

export interface CreateOrderBody {
  userId: number;
  cartIds: number[];
  quantity: number;
  shippingReceiver: string;
  shippingPhone: string;
  shippingZipCode: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingAddress: string;
  personalizationNote?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  userName: string;
  quantity: number;
  totalPrice: number;
}

/** `GET /api/v1/orders?user=` → `OrdersItemResponse` */
export async function getOrdersForUser(userId: number): Promise<Order[]> {
  const response = await http.get<{ orders: Order[] }>(ORDER_API_BASE_URL, {
    params: { user: userId },
  });
  return response.data.orders ?? [];
}

export async function createOrder(body: CreateOrderBody): Promise<CreateOrderResponse> {
  const response = await http.post<{
    orderId: number;
    userName: string;
    quantity: number;
    totalPrice: number;
  }>(ORDER_API_BASE_URL, body);
  const raw = response.data;
  return {
    orderId: raw.orderId,
    userName: raw.userName,
    quantity: raw.quantity,
    totalPrice: raw.totalPrice,
  };
}
