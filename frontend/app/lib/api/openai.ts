import type { StudioProductId } from "@/config/studioProducts";

import { http } from "./http";

const OPENAI_IMAGE_BASE = "/api/v1/openai/images";

export interface GenerateOpenAiImageBody {
  prompt: string;
}

/** 백엔드 `OpenaiImageResponse` — `imageUrl`은 백엔드에 필드가 있을 때만 사용 */
export interface GenerateOpenAiImageResponse {
  b64Json: string | null;
  imageUrl?: string | null;
}

export interface UniformReferenceTeamOption {
  id: string;
  labelKo: string;
}

export type UniformKitType = "HOME" | "AWAY";

export interface GenerateUniformProposalParams {
  referenceTeamId: string;
  kitType: UniformKitType;
  teamName: string;
  /** 없으면 로고 없이 팀명 타이포만 반영한 시안 */
  logo?: File | null;
}

export async function generateOpenAiImage(
  body: GenerateOpenAiImageBody,
): Promise<GenerateOpenAiImageResponse> {
  const res = await http.post<GenerateOpenAiImageResponse>(
    `${OPENAI_IMAGE_BASE}/generate`,
    body,
  );
  return res.data;
}

/** 레거시: 틀 + 마스크 인페인트 */
export async function editUniformInpaint(params: {
  prompt: string;
  template: Blob;
  mask: Blob;
}): Promise<GenerateOpenAiImageResponse> {
  const fd = new FormData();
  fd.append("prompt", params.prompt);
  fd.append("template", params.template, "template.png");
  fd.append("mask", params.mask, "mask.png");
  const res = await http.post<GenerateOpenAiImageResponse>(
    `${OPENAI_IMAGE_BASE}/edit-uniform`,
    fd,
    {
      headers: { "Content-Type": false },
    },
  );
  return res.data;
}

export async function fetchUniformReferenceTeams(): Promise<
  UniformReferenceTeamOption[]
> {
  const res = await http.get<UniformReferenceTeamOption[]>(
    `${OPENAI_IMAGE_BASE}/uniform-reference-teams`,
  );
  return res.data;
}

/** 제안서 레이아웃 시안 (템플릿은 서버 고정 + 로고 업로드) */
export async function generateUniformProposal(
  params: GenerateUniformProposalParams,
): Promise<GenerateOpenAiImageResponse> {
  const fd = new FormData();
  fd.append("referenceTeamId", params.referenceTeamId);
  fd.append("kitType", params.kitType);
  fd.append("teamName", params.teamName);
  if (params.logo) {
    fd.append("logo", params.logo, params.logo.name || "logo.png");
  }
  const res = await http.post<GenerateOpenAiImageResponse>(
    `${OPENAI_IMAGE_BASE}/uniform-proposal`,
    fd,
    {
      headers: { "Content-Type": false },
    },
  );
  return res.data;
}

export interface GenerateProductProposalParams {
  productId: Exclude<StudioProductId, "uniform">;
  teamName: string;
  notes?: string;
  /** 내 디자인에 저장한 유니폼 시안 — 스타일 참조용 */
  uniformReference?: File | null;
}

/** 축구화·키퍼 장갑·스포츠 용품 제안서 (템플릿 서버 고정 + 선택 유니폼 시안) */
export async function generateProductProposal(
  params: GenerateProductProposalParams,
): Promise<GenerateOpenAiImageResponse> {
  const fd = new FormData();
  fd.append("productId", params.productId);
  fd.append("teamName", params.teamName);
  if (params.notes?.trim()) {
    fd.append("notes", params.notes.trim());
  }
  if (params.uniformReference) {
    fd.append(
      "uniformReference",
      params.uniformReference,
      params.uniformReference.name || "uniform-reference.png",
    );
  }
  const res = await http.post<GenerateOpenAiImageResponse>(
    `${OPENAI_IMAGE_BASE}/product-proposal`,
    fd,
    {
      headers: { "Content-Type": false },
    },
  );
  return res.data;
}
