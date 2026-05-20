"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent } from "react";

import {
  fetchUniformReferenceTeams,
  generateOpenAiImage,
  generateProductProposal,
  generateUniformProposal,
  type UniformKitType,
  type UniformReferenceTeamOption,
} from "@/app/lib/api/openai";
import { formatApiError } from "@/app/lib/api/formatApiError";
import { http } from "@/app/lib/api/http";
import {
  fetchLogoAssetAsFile,
  fetchMyLogoAssets,
  logoAssetImageUrl,
  saveLogoAsset,
  titleFromLogoPrompt,
  type MyLogoAssetItem,
} from "@/app/lib/api/logoAssets";
import ImageGenerationLoading, {
  ImageGenerationSpinner,
} from "@/components/studio/ImageGenerationLoading";
import ProductDraftHero from "@/components/studio/ProductDraftHero";
import ProductDraftPicker from "@/components/studio/ProductDraftPicker";
import {
  customMakerStudioBoxBackgrounds,
  uniformProposalTemplateUrl,
} from "@/config/customMakerStudio";
import {
  buildLogoGenerationPrompt,
  logoGenerationCompletedMessage,
  logoGenerationCreatingMessage,
  logoGenerationIdleMessage,
} from "@/config/logoGeneration";
import {
  buildProductDraftPrompt,
  getRecommendImageSrc,
  getStudioProduct,
  productProposalTemplateUrl,
  type StudioProductId,
} from "@/config/studioProducts";
import { DEFAULT_UNIFORM_REFERENCE_TEAM_ID } from "@/config/uniformReferenceTeams";
import {
  createGeneratedPreviewId,
  patchGeneratedPreview,
  saveGeneratedPreview,
} from "@/lib/customMaker/generatedPreview";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/session";
import {
  normalizeDesignCategory,
  type DesignCategoryLabel,
} from "@/lib/designCategories";

type StudioMode = "generate" | "uniform-proposal";
type WorkspaceKind = "logo" | "uniform" | "product";

type CustomMakerInteractiveProps = {
  initialProduct?: StudioProductId;
  showProductPicker?: boolean;
};

const DEFAULT_TEAM_NAME = "";

function teamNameFromUniformPrompt(prompt: string): string | null {
  const m = prompt.match(/팀명:\s*([^·\n]+)/);
  const t = m?.[1]?.trim();
  return t || null;
}

function initialWorkspace(
  showProductPicker: boolean,
  product: StudioProductId,
): WorkspaceKind {
  if (!showProductPicker) return "logo";
  return product === "uniform" ? "uniform" : "product";
}

function initialMode(
  showProductPicker: boolean,
  product: StudioProductId,
): StudioMode {
  if (!showProductPicker) return "generate";
  return product === "uniform" ? "uniform-proposal" : "generate";
}

export default function CustomMakerInteractive({
  initialProduct = "uniform",
  showProductPicker = false,
}: CustomMakerInteractiveProps) {
  const [authed, setAuthed] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<StudioProductId>(initialProduct);
  const [workspace, setWorkspace] = useState<WorkspaceKind>(() =>
    initialWorkspace(showProductPicker, initialProduct),
  );
  const [mode, setMode] = useState<StudioMode>(() =>
    initialMode(showProductPicker, initialProduct),
  );
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewUniform, setPreviewUniform] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<string | null>(null);
  const [b64Logo, setB64Logo] = useState<string | null>(null);
  const [b64Uniform, setB64Uniform] = useState<string | null>(null);
  const [b64Product, setB64Product] = useState<string | null>(null);
  const [productNotes, setProductNotes] = useState("");
  const [productPromptSummary, setProductPromptSummary] = useState("");
  const [myUniforms, setMyUniforms] = useState<MyLogoAssetItem[]>([]);
  const [myUniformsLoading, setMyUniformsLoading] = useState(false);
  const [selectedSavedUniformId, setSelectedSavedUniformId] = useState<
    number | null
  >(null);
  const [uniformReferenceFile, setUniformReferenceFile] = useState<File | null>(
    null,
  );
  const [uniformReferencePreviewUrl, setUniformReferencePreviewUrl] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [referenceTeams, setReferenceTeams] = useState<
    UniformReferenceTeamOption[]
  >([]);
  const [referenceTeamId, setReferenceTeamId] = useState(
    DEFAULT_UNIFORM_REFERENCE_TEAM_ID,
  );
  const [kitType, setKitType] = useState<UniformKitType>("HOME");
  const [teamName, setTeamName] = useState(DEFAULT_TEAM_NAME);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [selectedSavedLogoId, setSelectedSavedLogoId] = useState<number | null>(
    null,
  );
  const [myLogos, setMyLogos] = useState<MyLogoAssetItem[]>([]);
  const [myLogosLoading, setMyLogosLoading] = useState(false);
  const [uniformPromptSummary, setUniformPromptSummary] = useState("");
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);

  const previewSrc =
    workspace === "logo"
      ? previewLogo
      : workspace === "uniform"
        ? previewUniform
        : previewProduct;
  const lastB64Png =
    workspace === "logo"
      ? b64Logo
      : workspace === "uniform"
        ? b64Uniform
        : b64Product;
  const savePrompt =
    workspace === "logo"
      ? buildLogoGenerationPrompt(teamName)
      : workspace === "uniform"
        ? uniformPromptSummary
        : productPromptSummary;

  const activeProductConfig = getStudioProduct(selectedProduct);
  const recommendHeroSrc = showProductPicker
    ? getRecommendImageSrc(selectedProduct)
    : null;
  const hasUniformReference = Boolean(uniformReferenceFile);

  const syncAuth = useCallback(() => {
    setAuthed(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
  }, [syncAuth]);

  useEffect(() => {
    let cancelled = false;
    fetchUniformReferenceTeams()
      .then((teams) => {
        if (cancelled) return;
        setReferenceTeams(teams);
        if (teams.length > 0) {
          setReferenceTeamId((current) =>
            teams.some((t) => t.id === current) ? current : teams[0].id,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setReferenceTeams([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (uniformReferencePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(uniformReferencePreviewUrl);
      }
    };
  }, [logoPreviewUrl, uniformReferencePreviewUrl]);

  const prevInitialProductRef = useRef(initialProduct);

  useEffect(() => {
    if (!showProductPicker) return;
    if (prevInitialProductRef.current !== initialProduct) {
      clearProductDraftPreview();
      prevInitialProductRef.current = initialProduct;
    }
    setSelectedProduct(initialProduct);
    if (initialProduct === "uniform") {
      setWorkspace("uniform");
      setMode("uniform-proposal");
    } else {
      setWorkspace("product");
    }
  }, [showProductPicker, initialProduct]);

  useEffect(() => {
    if (workspace !== "uniform" || !authed) {
      setMyLogos([]);
      return;
    }
    let cancelled = false;
    setMyLogosLoading(true);
    fetchMyLogoAssets()
      .then((list) => {
        if (cancelled) return;
        setMyLogos(
          list.filter((item) => String(item.category).trim() === "로고"),
        );
      })
      .catch(() => {
        if (!cancelled) setMyLogos([]);
      })
      .finally(() => {
        if (!cancelled) setMyLogosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspace, authed]);

  useEffect(() => {
    if (workspace !== "product" || !authed) {
      setMyUniforms([]);
      return;
    }
    let cancelled = false;
    setMyUniformsLoading(true);
    fetchMyLogoAssets()
      .then((list) => {
        if (cancelled) return;
        setMyUniforms(
          list.filter((item) => String(item.category).trim() === "유니폼"),
        );
      })
      .catch(() => {
        if (!cancelled) setMyUniforms([]);
      })
      .finally(() => {
        if (!cancelled) setMyUniformsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspace, authed]);

  function clearUniformReference() {
    setSelectedSavedUniformId(null);
    setUniformReferenceFile(null);
    if (uniformReferencePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(uniformReferencePreviewUrl);
    }
    setUniformReferencePreviewUrl(null);
  }

  /** 축구화·키퍼·스포츠 공용 preview — 상품 탭/URL 전환 시 이전 시안이 남지 않게 */
  function clearProductDraftPreview() {
    setPreviewProduct(null);
    setB64Product(null);
    setProductPromptSummary("");
    setPreviewSessionId(null);
    setSaveMessage("");
  }

  function resolveProductTeamName(): string {
    if (!hasUniformReference) {
      return teamName.trim();
    }
    const item = myUniforms.find((u) => u.id === selectedSavedUniformId);
    if (item) {
      const fromPrompt = teamNameFromUniformPrompt(item.prompt);
      if (fromPrompt) return fromPrompt;
    }
    return teamName.trim() || "팀";
  }

  function handleSelectProduct(id: StudioProductId) {
    if (selectedProduct !== id) {
      clearProductDraftPreview();
    }
    setSelectedProduct(id);
    setError("");
    clearUniformReference();
    if (id === "uniform") {
      setWorkspace("uniform");
      setMode("uniform-proposal");
    } else {
      setWorkspace("product");
    }
  }

  function setModeAndClearMessage(next: StudioMode) {
    setMode(next);
    setError("");
    setSaveMessage("");
    setPreviewSessionId(null);
    if (next === "generate") {
      setWorkspace("logo");
    }
    if (next === "uniform-proposal") {
      setWorkspace("uniform");
      setSelectedProduct("uniform");
    }
    if (next !== "uniform-proposal") {
      setSelectedSavedLogoId(null);
    }
  }

  function saveCategoryForWorkspace(): DesignCategoryLabel {
    if (workspace === "logo") return "로고";
    if (workspace === "uniform") return "유니폼";
    return normalizeDesignCategory(activeProductConfig?.saveCategory);
  }

  function storePreviewSession(params: {
    previewSrc: string;
    b64Png: string | null;
    promptSummary: string;
    generationPrompt?: string;
  }) {
    const id = createGeneratedPreviewId();
    const category = saveCategoryForWorkspace();
    const title =
      workspace === "logo"
        ? "생성된 로고"
        : workspace === "uniform"
          ? "유니폼 제안서 시안"
          : `${activeProductConfig?.label ?? "상품"} 시안`;
    saveGeneratedPreview({
      id,
      kind:
        workspace === "logo"
          ? "logo"
          : workspace === "uniform"
            ? "uniform"
            : "product",
      category,
      title,
      promptSummary: params.promptSummary,
      generationPrompt: params.generationPrompt,
      previewSrc: params.previewSrc,
      b64Png: params.b64Png,
      createdAt: Date.now(),
    });
    setPreviewSessionId(id);
  }

  function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setSelectedSavedLogoId(null);
    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl(null);
      return;
    }
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSelectSavedUniform(item: MyLogoAssetItem) {
    setError("");
    setSelectedSavedUniformId(item.id);
    try {
      const file = await fetchLogoAssetAsFile(
        item.accessPath,
        `uniform-${item.id}.png`,
      );
      if (uniformReferencePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(uniformReferencePreviewUrl);
      }
      setUniformReferenceFile(file);
      setUniformReferencePreviewUrl(logoAssetImageUrl(item.accessPath));
      setProductNotes("");
    } catch {
      setError("저장된 유니폼 시안을 불러오지 못했습니다. 다시 시도해 주세요.");
      clearUniformReference();
    }
  }

  async function handleSelectSavedLogo(item: MyLogoAssetItem) {
    setError("");
    setSelectedSavedLogoId(item.id);
    try {
      const file = await fetchLogoAssetAsFile(
        item.accessPath,
        `logo-${item.id}.png`,
      );
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoFile(file);
      setLogoPreviewUrl(logoAssetImageUrl(item.accessPath));
    } catch {
      setError("저장된 로고를 불러오지 못했습니다. 다시 시도해 주세요.");
      setSelectedSavedLogoId(null);
      setLogoFile(null);
      setLogoPreviewUrl(null);
    }
  }

  function buildUniformPromptSummary(withoutLogo = false): string {
    const teamLabel =
      referenceTeams.find((t) => t.id === referenceTeamId)?.labelKo ??
      referenceTeamId;
    const base = `[유니폼 시안] 레퍼런스: ${teamLabel} (${kitType}), 팀명: ${teamName}`;
    return withoutLogo ? `${base} · 로고 없음` : base;
  }

  function applyGeneratedImage(data: {
    b64Json?: string | null;
    imageUrl?: string | null;
  }): { nextPreviewSrc: string | null; nextB64: string | null } {
    if (data.b64Json) {
      const nextPreviewSrc = `data:image/png;base64,${data.b64Json}`;
      if (workspace === "logo") {
        setB64Logo(data.b64Json);
        setPreviewLogo(nextPreviewSrc);
      } else if (workspace === "uniform") {
        setB64Uniform(data.b64Json);
        setPreviewUniform(nextPreviewSrc);
      } else {
        setB64Product(data.b64Json);
        setPreviewProduct(nextPreviewSrc);
      }
      return { nextPreviewSrc, nextB64: data.b64Json };
    }
    if (data.imageUrl) {
      if (workspace === "logo") {
        setB64Logo(null);
        setPreviewLogo(data.imageUrl);
      } else if (workspace === "uniform") {
        setB64Uniform(null);
        setPreviewUniform(data.imageUrl);
      } else {
        setB64Product(null);
        setPreviewProduct(data.imageUrl);
      }
      return { nextPreviewSrc: data.imageUrl, nextB64: null };
    }
    setError("응답에 이미지 데이터(b64Json / imageUrl)가 없습니다.");
    return { nextPreviewSrc: null, nextB64: null };
  }

  async function runGenerate(withoutLogo = false) {
    setError("");
    setSaveMessage("");
    setLoading(true);
    try {
      let data;
      let promptSummary = "";

      if (workspace === "product") {
        const effectiveTeamName = resolveProductTeamName();
        if (!hasUniformReference && !effectiveTeamName) {
          setError("팀 이름을 입력해 주세요.");
          return;
        }
        if (
          selectedProduct !== "cleats" &&
          selectedProduct !== "keeper" &&
          selectedProduct !== "sports"
        ) {
          setError("지원하지 않는 상품입니다.");
          return;
        }
        promptSummary = buildProductDraftPrompt(
          selectedProduct,
          effectiveTeamName,
          hasUniformReference ? undefined : productNotes,
        );
        if (hasUniformReference) {
          promptSummary += " · 유니폼 시안 참조";
        }
        setProductPromptSummary(promptSummary);
        data = await generateProductProposal({
          productId: selectedProduct,
          teamName: effectiveTeamName,
          notes: hasUniformReference ? undefined : productNotes,
          uniformReference: uniformReferenceFile ?? undefined,
        });
      } else if (workspace === "uniform") {
        if (!withoutLogo && !logoFile) {
          setError(
            "내 디자인에서 로고를 선택하거나 파일을 업로드해 주세요. 로고 없이 만들려면 「로고 없이 시안보기」를 이용해 주세요.",
          );
          return;
        }
        if (!teamName.trim()) {
          setError("팀 이름을 입력해 주세요.");
          return;
        }
        promptSummary = buildUniformPromptSummary(withoutLogo);
        setUniformPromptSummary(promptSummary);
        data = await generateUniformProposal({
          referenceTeamId,
          kitType,
          teamName: teamName.trim(),
          logo: withoutLogo ? undefined : logoFile ?? undefined,
        });
      } else {
        if (!teamName.trim()) {
          setError("팀 이름을 입력해 주세요.");
          return;
        }
        const generationPrompt = buildLogoGenerationPrompt(teamName);
        promptSummary = logoGenerationCompletedMessage(teamName);
        data = await generateOpenAiImage({
          prompt: generationPrompt,
        });
        const { nextPreviewSrc, nextB64 } = applyGeneratedImage(data);
        if (nextPreviewSrc) {
          storePreviewSession({
            previewSrc: nextPreviewSrc,
            b64Png: nextB64,
            promptSummary,
            generationPrompt,
          });
        }
        return;
      }

      const { nextPreviewSrc, nextB64 } = applyGeneratedImage(data);
      if (nextPreviewSrc) {
        storePreviewSession({
          previewSrc: nextPreviewSrc,
          b64Png: nextB64,
          promptSummary,
        });
      }
    } catch (err: unknown) {
      setError(formatApiError(err, "이미지 생성 요청 실패"));
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    void runGenerate(false);
  }

  async function handleSave() {
    if (!lastB64Png) return;
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      const { id, accessPath } = await saveLogoAsset({
        prompt: savePrompt,
        b64Png: lastB64Png,
        category: saveCategoryForWorkspace(),
      });
      const base = (http.defaults.baseURL ?? "").replace(/\/$/, "");
      const fileUrl = `${base}${accessPath}`;
      if (previewSessionId) {
        patchGeneratedPreview(previewSessionId, {
          savedAssetId: id,
          savedAccessPath: accessPath,
          previewSrc: fileUrl,
        });
      }
      setSaveMessage(`저장됨 (id: ${id}) · 내 디자인에서 확인할 수 있습니다.`);
      if (workspace === "logo" && authed) {
        const list = await fetchMyLogoAssets();
        setMyLogos(list.filter((item) => String(item.category).trim() === "로고"));
      }
    } catch (err: unknown) {
      setError(formatApiError(err, "이미지 저장 요청 실패"));
    } finally {
      setSaving(false);
    }
  }

  const bigBoxWrapClass = "studio-maker-box-wrap";
  const bigBoxClass =
    "group absolute inset-0 flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm border px-6 text-center transition [-webkit-tap-highlight-color:transparent]";
  const boxImageFrameClass =
    "pointer-events-none absolute inset-0 z-0 overflow-hidden";
  const boxImageBgClass =
    "absolute inset-0 origin-center bg-cover bg-center transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 will-change-transform group-hover:scale-[1.05] motion-reduce:duration-0 motion-reduce:group-hover:scale-100";
  const boxImageOverlayClass =
    "pointer-events-none absolute inset-0 z-[1] bg-black/55 transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0 group-[.is-active]:opacity-0 motion-reduce:duration-0 motion-reduce:group-hover:opacity-100 motion-reduce:group-[.is-active]:opacity-100";
  const boxImageTextWrap =
    "relative z-10 flex flex-col items-center transition-[color,filter] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  const bigBoxIdle = "border-neutral-200 hover:border-neutral-400";
  const bigBoxActive =
    "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 ring-offset-white";

  const previewLabel =
    workspace === "logo"
      ? "로고 미리보기"
      : workspace === "uniform"
        ? "유니폼 시안 미리보기"
        : `${activeProductConfig?.label ?? "상품"} 시안 미리보기`;
  const previewPlaceholder =
    workspace === "logo"
      ? "로고 자리"
      : workspace === "uniform"
        ? "유니폼 제안서 자리"
        : `${activeProductConfig?.label ?? "상품"} 시안 자리`;
  const previewAlt =
    workspace === "logo"
      ? "생성된 로고"
      : workspace === "uniform"
        ? "생성된 유니폼 제안서"
        : `생성된 ${activeProductConfig?.label ?? "상품"} 시안`;

  const logoBg = customMakerStudioBoxBackgrounds.logoBox;
  const uniformBg = customMakerStudioBoxBackgrounds.uniformBox;

  const logoBoxBgStyle: CSSProperties | undefined = logoBg
    ? {
        backgroundImage: `url(${logoBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  const uniformBoxBgStyle: CSSProperties | undefined = uniformBg
    ? {
        backgroundImage: `url(${uniformBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const saveButtonLabel =
    workspace === "logo"
      ? "로고 저장 (내 디자인 · 유니폼용)"
      : workspace === "uniform"
        ? "유니폼 시안 저장 (내 디자인)"
        : `${activeProductConfig?.label ?? "상품"} 시안 저장 (내 디자인)`;

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {showProductPicker ? (
        <>
          <ProductDraftPicker
            selected={selectedProduct}
            onSelect={handleSelectProduct}
          />
          <ProductDraftHero productId={selectedProduct} />
        </>
      ) : (
      <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={bigBoxWrapClass}>
        <button
          type="button"
          aria-pressed={workspace === "logo"}
          onClick={() => setModeAndClearMessage("generate")}
          className={`${bigBoxClass} ${logoBg ? "" : "bg-neutral-100"} ${workspace === "logo" ? `${bigBoxActive} is-active` : bigBoxIdle}`}
        >
          {logoBg ? (
            <>
              <span className={boxImageFrameClass} aria-hidden>
                <span className={boxImageBgClass} style={logoBoxBgStyle} />
              </span>
              <span className={boxImageOverlayClass} aria-hidden />
            </>
          ) : null}
          <span
            className={
              logoBg
                ? boxImageTextWrap
                : "relative z-10 flex flex-col items-center"
            }
          >
            <span
              className={`text-xs font-medium uppercase tracking-[0.2em] ${
                logoBg
                  ? "text-white/85 drop-shadow-sm group-hover:text-white/90 group-[.is-active]:text-white/90"
                  : "text-neutral-500"
              }`}
            >
              LOGO
            </span>
            <span
              className={`mt-3 text-lg font-semibold md:text-xl ${
                logoBg
                  ? "text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] group-hover:drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] group-[.is-active]:drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]"
                  : "text-neutral-900"
              }`}
            >
              팀 로고 생성
            </span>
            <span
              className={`mt-2 max-w-xs text-sm ${
                logoBg
                  ? "text-white/90 drop-shadow-sm group-hover:text-white group-[.is-active]:text-white"
                  : "text-neutral-600"
              }`}
            >
              팀 이름만 입력하면 선화 로고가 생성됩니다.
            </span>
          </span>
        </button>
        </div>
        <div className={bigBoxWrapClass}>
        <button
          type="button"
          aria-pressed={workspace === "uniform"}
          onClick={() => setModeAndClearMessage("uniform-proposal")}
          className={`${bigBoxClass} ${uniformBg ? "" : "bg-neutral-100"} ${workspace === "uniform" ? `${bigBoxActive} is-active` : bigBoxIdle}`}
        >
          {uniformBg ? (
            <>
              <span className={boxImageFrameClass} aria-hidden>
                <span className={boxImageBgClass} style={uniformBoxBgStyle} />
              </span>
              <span className={boxImageOverlayClass} aria-hidden />
            </>
          ) : null}
          <span
            className={
              uniformBg
                ? boxImageTextWrap
                : "relative z-10 flex flex-col items-center"
            }
          >
            <span
              className={`text-xs font-medium uppercase tracking-[0.2em] ${
                uniformBg
                  ? "text-white/85 drop-shadow-sm group-hover:text-white/90 group-[.is-active]:text-white/90"
                  : "text-neutral-500"
              }`}
            >
              UNIFORM
            </span>
            <span
              className={`mt-3 text-lg font-semibold md:text-xl ${
                uniformBg
                  ? "text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] group-hover:drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] group-[.is-active]:drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]"
                  : "text-neutral-900"
              }`}
            >
              유니폼 시안 생성
            </span>
            <span
              className={`mt-2 max-w-xs text-sm ${
                uniformBg
                  ? "text-white/90 drop-shadow-sm group-hover:text-white group-[.is-active]:text-white"
                  : "text-neutral-600"
              }`}
            >
              레퍼런스 팀·로고로 제안서 형식 시안을 만듭니다.
            </span>
          </span>
        </button>
        </div>
      </div>

      <div
        className="mx-auto flex w-full max-w-xl flex-col gap-2"
        role="tablist"
        aria-label="생성 모드"
      >
        {/* 개발 안내 — 배포 전까지 숨김
        <span className="text-center text-xs font-medium tracking-wide text-neutral-500">
          생성 종류 선택
        </span>
        */}
        <div className="flex rounded-full border border-neutral-200 bg-neutral-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={workspace === "logo"}
            onClick={() => setModeAndClearMessage("generate")}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              workspace === "logo"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            로고 생성
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={workspace === "uniform"}
            onClick={() => setModeAndClearMessage("uniform-proposal")}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              workspace === "uniform"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            유니폼 시안
          </button>
        </div>
      </div>
      </>
      )}

      {!authed ? (
        <div className="mx-auto w-full max-w-2xl rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-950">
          <p className="font-medium">로그인 후 이용할 수 있습니다.</p>
          {/* 개발 안내 — 배포 전까지 숨김
          <p className="mt-1 text-xs text-amber-800/90">
            이미지 생성·저장은 회원 인증(JWT)이 필요합니다.
          </p>
          */}
          <Link
            href="/login"
            className="mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white"
          >
            로그인하기
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div className="w-full">
            <p className="mb-2 text-sm font-medium text-neutral-700">
              {previewLabel}
            </p>
            <div
              className="studio-maker-preview-frame relative flex w-full items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 p-4"
              aria-busy={loading}
            >
              {!loading && previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt={previewAlt}
                  className="max-h-[55vh] w-full object-contain md:max-h-[420px]"
                />
              ) : !loading && recommendHeroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recommendHeroSrc}
                  alt={previewAlt}
                  className="max-h-[55vh] w-full object-contain opacity-40 md:max-h-[420px]"
                />
              ) : !loading ? (
                <span className="text-neutral-500">{previewPlaceholder}</span>
              ) : null}
              {loading ? (
                <>
                  {(previewSrc ?? recommendHeroSrc) ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc ?? recommendHeroSrc ?? ""}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-contain opacity-25 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-neutral-900/40" aria-hidden />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200"
                      aria-hidden
                    />
                  )}
                  <ImageGenerationLoading
                    overlay={Boolean(previewSrc ?? recommendHeroSrc)}
                    className="relative z-10 w-full"
                  />
                </>
              ) : null}
            </div>
            {previewSrc && previewSessionId ? (
              <Link
                href={`/design/preview?id=${encodeURIComponent(previewSessionId)}`}
                className="mt-3 block w-full rounded-md border border-neutral-900 bg-white px-3 py-2.5 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                자세히 보기
              </Link>
            ) : null}
            <button
              type="button"
              disabled={!lastB64Png || saving || loading}
              onClick={handleSave}
              className="mt-4 w-full rounded border border-neutral-400 px-3 py-2 text-sm disabled:opacity-40"
            >
              {saving ? "저장 중…" : saveButtonLabel}
            </button>
            {!lastB64Png && previewSrc ? (
              <p className="mt-2 text-xs text-amber-700">
                URL로만 받은 이미지는 base64가 없어 저장 API를 쓸 수 없습니다.
              </p>
            ) : null}
            {saveMessage ? (
              <p className="mt-2 break-all text-xs text-green-700">
                {saveMessage}
              </p>
            ) : null}
          </div>

          <div className="w-full border-t border-neutral-200 pt-6">
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {workspace === "logo" ? (
                <>
                  <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">
                    {loading
                      ? logoGenerationCreatingMessage(teamName)
                      : logoGenerationIdleMessage()}
                  </p>
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="logo-team-name"
                    >
                      팀 이름
                    </label>
                    <input
                      id="logo-team-name"
                      type="text"
                      className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="예: Slowind"
                      required
                    />
                  </div>
                </>
              ) : workspace === "uniform" ? (
                <>
                  <p className="text-sm text-neutral-600">
                    레퍼런스 팀 유니폼 스타일과 팀 로고를 반영해, 고정
                    제안서 템플릿 형식으로 시안 1장을 생성합니다.
                  </p>
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="uniform-ref-team"
                    >
                      레퍼런스 팀 선택
                    </label>
                    <select
                      id="uniform-ref-team"
                      className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                      value={referenceTeamId}
                      onChange={(e) => setReferenceTeamId(e.target.value)}
                      required
                    >
                      {referenceTeams.length === 0 ? (
                        <option value={referenceTeamId}>
                          {referenceTeamId}
                        </option>
                      ) : (
                        referenceTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.labelKo}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-medium">
                      레퍼런스 팀 유니폼 (홈 / 어웨이)
                    </legend>
                    <div className="mt-2 flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="kitType"
                          value="HOME"
                          checked={kitType === "HOME"}
                          onChange={() => setKitType("HOME")}
                        />
                        Home
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="kitType"
                          value="AWAY"
                          checked={kitType === "AWAY"}
                          onChange={() => setKitType("AWAY")}
                        />
                        Away
                      </label>
                    </div>
                  </fieldset>
                  <div>
                    <label
                      className="text-sm font-medium"
                      htmlFor="uniform-team-name"
                    >
                      당신의 팀 이름
                    </label>
                    <input
                      id="uniform-team-name"
                      type="text"
                      className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="예: Slowind"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="mt-2 text-sm font-medium">
                      내 디자인에 저장한 로고
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      로고를 저장한 뒤 여기서 고르거나, 아래에서 새 파일을
                      업로드할 수 있습니다.
                    </p>
                    {!authed ? (
                      <p className="text-xs text-neutral-600">
                        <Link
                          href="/login"
                          className="font-medium text-neutral-900 underline"
                        >
                          로그인
                        </Link>
                        하면 저장한 로고를 불러옵니다.
                      </p>
                    ) : myLogosLoading ? (
                      <p className="text-xs text-neutral-500">로고 불러오는 중…</p>
                    ) : myLogos.length === 0 ? (
                      <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-xs text-neutral-600">
                        저장된 로고가 없습니다. 먼저 「팀 로고 생성」으로 로고를
                        만든 뒤 「로고 저장」을 눌러 주세요.
                      </p>
                    ) : (
                      <ul className="mt-2 grid max-h-64 list-none grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                        {myLogos.map((item) => {
                          const selected = selectedSavedLogoId === item.id;
                          return (
                            <li
                              key={item.id}
                              className={`flex flex-col overflow-hidden rounded-md border bg-white ${
                                selected
                                  ? "border-neutral-900 ring-1 ring-neutral-900"
                                  : "border-neutral-200"
                              }`}
                            >
                              <div className="aspect-square bg-neutral-50 p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={logoAssetImageUrl(item.accessPath)}
                                  alt={titleFromLogoPrompt(item.prompt)}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="flex flex-1 flex-col gap-2 border-t border-neutral-100 p-2">
                                <p className="line-clamp-2 text-[11px] text-neutral-600">
                                  {titleFromLogoPrompt(item.prompt)}
                                </p>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => void handleSelectSavedLogo(item)}
                                  className={`w-full rounded px-2 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                                    selected
                                      ? "bg-neutral-900 text-white"
                                      : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
                                  }`}
                                >
                                  {selected ? "선택됨" : "이 로고 사용하기"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <label
                      className="mt-4 block text-sm font-medium"
                      htmlFor="uniform-team-logo"
                    >
                      또는 로고 파일 업로드
                    </label>
                    <input
                      id="uniform-team-logo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="mt-2 w-full text-sm"
                      onChange={handleLogoFileChange}
                    />
                    {logoPreviewUrl ? (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-neutral-700">
                          선택된 로고
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreviewUrl}
                          alt="유니폼에 사용할 로고 미리보기"
                          className="mt-1 max-h-28 rounded border border-neutral-200 bg-white object-contain p-2"
                        />
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-neutral-500">
                    레이아웃 템플릿 미리보기:{" "}
                    <code className="rounded bg-neutral-200 px-1">
                      {uniformProposalTemplateUrl}
                    </code>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-600">
                    {activeProductConfig?.shortDescription ??
                      "팀 컨셉에 맞춘 제품 시안을 생성합니다."}
                    유니폼 시안이 있으면 아래에서 선택해 색상·로고 스타일을
                    함께 반영할 수 있습니다.
                  </p>
                  {productProposalTemplateUrl(selectedProduct) ? (
                    <p className="text-xs text-neutral-500">
                      레이아웃 템플릿 미리보기:{" "}
                      <code className="rounded bg-neutral-200 px-1">
                        {productProposalTemplateUrl(selectedProduct)}
                      </code>
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      내 디자인에 저장한 유니폼 시안 (선택)
                    </p>
                    <p className="text-xs text-neutral-500">
                      선택한 유니폼 시안의 색상·패턴·로고를 참고해{" "}
                      {activeProductConfig?.label ?? "상품"} 시안을 만듭니다.
                    </p>
                    {!authed ? (
                      <p className="text-xs text-neutral-600">
                        <Link
                          href="/login"
                          className="font-medium text-neutral-900 underline"
                        >
                          로그인
                        </Link>
                        하면 저장한 유니폼 시안을 불러옵니다.
                      </p>
                    ) : myUniformsLoading ? (
                      <p className="text-xs text-neutral-500">
                        유니폼 시안 불러오는 중…
                      </p>
                    ) : myUniforms.length === 0 ? (
                      <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-xs text-neutral-600">
                        저장된 유니폼 시안이 없습니다. 유니폼 시안을 먼저 만든
                        뒤 저장하면 여기서 선택할 수 있습니다.
                      </p>
                    ) : (
                      <ul className="mt-2 grid max-h-64 list-none grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                        {myUniforms.map((item) => {
                          const selected = selectedSavedUniformId === item.id;
                          return (
                            <li
                              key={item.id}
                              className={`flex flex-col overflow-hidden rounded-md border bg-white ${
                                selected
                                  ? "border-neutral-900 ring-1 ring-neutral-900"
                                  : "border-neutral-200"
                              }`}
                            >
                              <div className="aspect-square bg-neutral-50 p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={logoAssetImageUrl(item.accessPath)}
                                  alt={titleFromLogoPrompt(item.prompt)}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="flex flex-1 flex-col gap-2 border-t border-neutral-100 p-2">
                                <p className="line-clamp-2 text-[11px] text-neutral-600">
                                  {titleFromLogoPrompt(item.prompt)}
                                </p>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() =>
                                    void handleSelectSavedUniform(item)
                                  }
                                  className={`w-full rounded px-2 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                                    selected
                                      ? "bg-neutral-900 text-white"
                                      : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
                                  }`}
                                >
                                  {selected
                                    ? "참조 선택됨"
                                    : "이 유니폼 참조하기"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {uniformReferencePreviewUrl ? (
                      <div className="mt-2 flex items-start justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                        <div>
                          <p className="text-xs font-medium text-neutral-700">
                            선택된 유니폼 참조
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uniformReferencePreviewUrl}
                            alt="유니폼 시안 참조 미리보기"
                            className="mt-1 max-h-28 rounded border border-neutral-200 bg-white object-contain p-2"
                          />
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-neutral-600 underline"
                          onClick={clearUniformReference}
                        >
                          선택 해제
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {hasUniformReference ? (
                    <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">
                      유니폼 시안을 참조할 때는 팀 이름·추가 요청 입력을
                      사용하지 않습니다. 선택한 유니폼의 색상·로고 스타일만
                      반영해 시안을 생성합니다.
                      {resolveProductTeamName() ? (
                        <>
                          <br />
                          <span className="text-neutral-500">
                            (유니폼 시안 팀명: {resolveProductTeamName()})
                          </span>
                        </>
                      ) : null}
                    </p>
                  ) : (
                    <>
                      <div>
                        <label
                          className="text-sm font-medium"
                          htmlFor="product-team-name"
                        >
                          팀 이름
                        </label>
                        <input
                          id="product-team-name"
                          type="text"
                          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="예: Slowind"
                          required
                        />
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium"
                          htmlFor="product-notes"
                        >
                          추가 요청 (선택)
                        </label>
                        <textarea
                          id="product-notes"
                          rows={3}
                          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                          value={productNotes}
                          onChange={(e) => setProductNotes(e.target.value)}
                          placeholder="색상, 소재, 디테일 등"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <ImageGenerationSpinner className="h-4 w-4" />
                      생성 중…
                    </>
                  ) : workspace === "uniform" ? (
                    "제안서 시안 생성"
                  ) : workspace === "logo" ? (
                    "로고 생성"
                  ) : (
                    `${activeProductConfig?.label ?? "상품"} 시안 생성`
                  )}
                </button>
                {workspace === "uniform" ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void runGenerate(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded border border-neutral-400 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ImageGenerationSpinner className="h-4 w-4" />
                        생성 중…
                      </>
                    ) : (
                      "로고 없이 시안보기"
                    )}
                  </button>
                ) : null}
              </div>
            </form>
            {error ? (
              <pre className="mt-3 max-h-40 overflow-auto rounded bg-red-50 p-2 text-xs text-red-800">
                {error}
              </pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
