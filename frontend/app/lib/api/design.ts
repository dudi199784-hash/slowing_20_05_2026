import { http } from "./http";
const DESIGN_API_BASE_URL = "/api/v1/designs";

/** Serialized `Design` entity from API */
export interface Design {
  memberSerial: number;
  productSerial: number;
  username: string;
  title: string;
  designCategory: string;
  id: number;
  designTitle: string;
  designDescription: string;
  createTime?: string;
  updateTime?: string;
}

/** POST `/api/v1/designs` body (`WriteRequest`) */
export interface CreateDesignBody {
  memberSerial: number;
  productSerial: number;
  username: string;
  title: string;
  designTitle: string;
  designDescription: string;
  designCategory: string;
}

/** PUT `/api/v1/designs/{id}` body (`UpdateDesignBody`) */
export interface UpdateDesignBody {
  memberSerial: number;
  productSerial: number;
  username: string;
  title: string;
  designTitle: string;
  designDescription: string;
  designCategory: string;
}

export const updateDesign = async (id: number, design: UpdateDesignBody) => {
  const response = await http.patch<DesignDetailResponse>(`${DESIGN_API_BASE_URL}/${id}`, design);
  return response.data;
};

/** `GET /api/v1/designs` body (`DesignsResponse`) */
export interface DesignsListResponse {
  designs: Design[];
}

export const getDesigns = async (): Promise<DesignsListResponse> => {
  const response = await http.get<DesignsListResponse>(DESIGN_API_BASE_URL);
  return response.data;
};

/** `GET /api/v1/designs/{id}` body (`DesignResponse`) */
export interface DesignDetailResponse {
  memberSerial: number;
  productSerial: number;
  username: string;
  title: string;
  designCategory: string;
  id: number;
  designTitle: string;
  designDescription: string;
  createTime?: string;
  updateTime?: string;
}

export const getDesign = async (id: number): Promise<DesignDetailResponse> => {
  const response = await http.get<DesignDetailResponse>(`${DESIGN_API_BASE_URL}/${id}`);
  return response.data;
};

export const createDesign = async (design: CreateDesignBody) => {
  const response = await http.post<DesignDetailResponse>(DESIGN_API_BASE_URL, design);
  return response.data;
};

export const deleteDesign = async (id: number) => {
  const response = await http.delete(`${DESIGN_API_BASE_URL}/${id}`);
  return response.data;
};