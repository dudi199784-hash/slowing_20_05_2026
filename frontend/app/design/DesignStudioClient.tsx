"use client";

import { useSearchParams } from "next/navigation";

import CustomMaker from "@/app/home/CustomMaker";
import { parseStudioProductParam } from "@/config/studioProducts";

export default function DesignStudioClient() {
  const searchParams = useSearchParams();
  const initialProduct = parseStudioProductParam(
    searchParams.get("product"),
  );

  return (
    <CustomMaker
      noTopMargin
      initialProduct={initialProduct ?? "uniform"}
      showProductPicker
    />
  );
}
