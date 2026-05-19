import { http } from "./http";

const CART_API_BASE_URL = "/api/v1/carts";

export interface Cart {
  id: number;
  memberId?: number;
  productId?: number;
  quantity?: number;
  createTime?: string;
  updateTime?: string;
}

export interface CartsListResponse {
  carts: Cart[];
}

export const getCarts = async (): Promise<CartsListResponse> => {
  const response = await http.get<CartsListResponse>(CART_API_BASE_URL);
  return response.data;
};