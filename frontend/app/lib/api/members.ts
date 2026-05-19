import type { MemberRole } from "@/lib/auth/types";

import { http } from "./http";
const MEMBER_API_BASE_URL = "/api/v1/members";
/** POST `/api/v1/products` body (`WriteRequest`) */
export interface CreateMemberBody {
  username: string;
  userId: string;
  userpassword: string;
}

/** PUT `/api/v1/products/{id}` body (`WriteRequest`) */
export interface UpdateMemberBody {
  username: string;
  userId: string;
  /** 비워 두면 서버에서 비밀번호는 바꾸지 않습니다. */
  userpassword?: string;
}

/** `Member` 엔티티 JSON (`MemberResponse.member` 등) — `userpassword`는 `@JsonIgnore` */
export interface Member {
  id: number;
  username: string;
  userId: string;
  userpassword?: string;
  role?: MemberRole;
  createTime?: string;
  updateTime?: string;
  shippingReceiver?: string | null;
  shippingPhone?: string | null;
  shippingZipCode?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingAddress?: string | null;
}

export interface UpdateMemberShippingBody {
  shippingReceiver: string;
  shippingPhone: string;
  shippingZipCode: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingAddress: string;
}

/** 백엔드 `MemberDto` — 로그인 응답 `memberDto` */
export interface MemberDto {
  id: number;
  userId: string;
  username?: string;
  role?: MemberRole;
  createTime?: string;
  modifyTime?: string;
}

/** `GET /api/v1/products` body (`ProductsResponse`) */
export interface MembersListResponse {
  members: Member[];
}

export const getMembers = async (): Promise<MembersListResponse> => {
  const response = await http.get<MembersListResponse>(MEMBER_API_BASE_URL);
  return response.data;
};

/** `GET /api/v1/products/{id}` body (`ProductResponse`) */
export interface MemberDetailResponse {
  member: Member;
}

export const getMember = async (id: number): Promise<MemberDetailResponse> => {
  const response = await http.get<MemberDetailResponse>(`${MEMBER_API_BASE_URL}/${id}`);
  return response.data;
};

export const createMember = async (product: CreateMemberBody) => {
  const response = await http.post(MEMBER_API_BASE_URL, product);
  return response.data;
};

export const updateMember = async (id: number, product: UpdateMemberBody) => {
  const response = await http.patch(`${MEMBER_API_BASE_URL}/${id}`, product);
  return response.data;
};

export const updateMemberShipping = async (
  id: number,
  body: UpdateMemberShippingBody,
): Promise<MemberDetailResponse> => {
  const response = await http.patch<MemberDetailResponse>(
    `${MEMBER_API_BASE_URL}/${id}/shipping`,
    body,
  );
  return response.data;
};

export const deleteMember = async (id: number) => {
  const response = await http.delete(`${MEMBER_API_BASE_URL}/${id}`);
  return response.data;
};

/** `ApiV1MemberController.LoginRequestBody` */
export interface LoginRequestBody {
  userId: string;
  password: string;
  /** 다른 기기 세션을 끊고 이 기기에서 로그인 */
  force?: boolean;
}

/** `ApiV1MemberController.LoginResponseBody` */
export interface LoginResponseBody {
  memberDto: MemberDto;
  accessToken: string;
}

export type SessionStatusResponse = {
  valid: boolean;
  memberId: number;
  userId: string;
};

export type SessionCheckResult =
  | { ok: true; data: SessionStatusResponse }
  | { ok: false; reason: "unauthorized" | "network" };

export async function fetchSessionStatus(): Promise<SessionCheckResult> {
  try {
    const res = await http.get<SessionStatusResponse>(
      `${MEMBER_API_BASE_URL}/session`,
    );
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401 || status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    return { ok: false, reason: "network" };
  }
}

export async function validateAuthSession(): Promise<boolean> {
  const result = await fetchSessionStatus();
  return result.ok && result.data.valid === true;
}

export async function logoutMember(): Promise<void> {
  await http.post(`${MEMBER_API_BASE_URL}/logout`);
}

export const login = async (body: LoginRequestBody): Promise<LoginResponseBody> => {
  const response = await http.post<Record<string, unknown>>(`${MEMBER_API_BASE_URL}/login`, body);
  const raw = response.data;
  const memberDto = (raw.memberDto ?? raw.member_dto) as LoginResponseBody["memberDto"] | undefined;
  const accessToken = (raw.accessToken ?? raw.access_token) as string | undefined;
  if (!memberDto || typeof accessToken !== "string") {
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }
  return { memberDto, accessToken };
};