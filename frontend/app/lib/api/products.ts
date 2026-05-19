import { http } from "./http";
const PRODUCT_API_BASE_URL = "/api/v1/products"
/** POST `/api/v1/products` body (`WriteRequest`) */
export interface CreateProductBody {
  title: string;
  description: string;
  category: string;
}

/** PUT `/api/v1/products/{id}` body (`WriteRequest`) */
export interface UpdateProductBody {
  title: string;
  description: string;
  category: string;
}

/** Serialized `Product` entity from API */
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  createTime?: string;
  updateTime?: string;
}

/** `GET /api/v1/products` body (`ProductsResponse`) */
export interface ProductsListResponse {
  products: Product[];
}

export const getProducts = async (): Promise<ProductsListResponse> => {
  const response = await http.get<ProductsListResponse>(PRODUCT_API_BASE_URL);
  return response.data;
};

/** `GET /api/v1/products/{id}` body (`ProductResponse`) */
export interface ProductDetailResponse {
  product: Product;
}

export const getProduct = async (id: number): Promise<ProductDetailResponse> => {
  const response = await http.get<ProductDetailResponse>(`${PRODUCT_API_BASE_URL}/${id}`);
  return response.data;
};

export const createProduct = async (product: CreateProductBody) => {
  const response = await http.post(PRODUCT_API_BASE_URL, product);
  return response.data;
};

export const updateProduct = async (id: number, product: UpdateProductBody) => {
  const response = await http.patch(`${PRODUCT_API_BASE_URL}/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await http.delete(`${PRODUCT_API_BASE_URL}/${id}`);
  return response.data;
};
