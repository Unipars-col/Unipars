"use client";

import {
  useRef,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { slugCategoria } from "../data/catalog";
import type { StoreProduct } from "@/lib/products";

type ImageSearchResponse = {
  product: StoreProduct;
  categoria: string;
  categoriaUrl: string;
  confianza: number;
  razon: string;
  comparedCount: number;
  mode?: "openai" | "local";
};

type Props = {
  fallbackProduct: StoreProduct;
  onNavigate?: () => void;
};

export default function ImageSearchClient({ fallbackProduct, onNavigate }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ImageSearchResponse | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const displayedProduct = result?.product ?? fallbackProduct;
  const categoryUrl =
    result?.categoriaUrl ||
    `/categorias?categoria=${slugCategoria(fallbackProduct.categoria)}`;

  const fileLabel = useMemo(() => {
    if (!selectedFile) return "Tamaño máximo de 3 MB.";
    return `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [selectedFile]);

  const setFile = (file: File | null) => {
    setSelectedFile(file);
    setResult(null);
    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Selecciona una imagen para analizar.");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as
        | ImageSearchResponse
        | { error?: string };

      if (!response.ok) {
        const errorPayload = payload as { error?: string };
        throw new Error(errorPayload.error || "No fue posible analizar la imagen.");
      }

      setResult(payload as ImageSearchResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible analizar la imagen.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
      {/* Input oculto para cámara */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[4px] border-2 border-dashed px-6 py-6 text-center transition-colors sm:min-h-[280px] ${
          isDragging
            ? "border-[#ed8435] bg-[#fff6ee]"
            : "border-[#a8adb3] bg-[#f7f7f7] hover:border-[#ed8435]/80 hover:bg-[#fffaf5]"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Imagen seleccionada"
            width={320}
            height={220}
            unoptimized
            className="max-h-[140px] w-auto max-w-full rounded-[4px] object-contain sm:max-h-[180px]"
          />
        ) : (
          <div className="flex h-28 w-36 items-center justify-center rounded-[6px] border border-[#c8d8ef] bg-white text-[#2877cf]">
            <svg
              aria-hidden="true"
              viewBox="0 0 64 64"
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M34 10v31" />
              <path d="m22 29 12 12 12-12" />
              <path d="M16 50h36" />
            </svg>
          </div>
        )}

        <p className="mt-7 text-sm text-[#6d737a]">
          Arrastra una imagen o{" "}
          <span className="font-semibold text-[#16384f] underline">
            sube un archivo
          </span>
        </p>
        <p className="mt-1 text-xs text-[#7b828a]">{fileLabel}</p>
      </label>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-[#7b828a]">JPG, PNG o WEBP.</p>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="Tomar foto con la cámara"
            className="flex items-center gap-1.5 rounded-full border border-[#16384f]/20 px-3 py-2 text-xs font-semibold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Tomar foto
          </button>
        </div>
        <button
          type="submit"
          disabled={!selectedFile || isAnalyzing}
          className="rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d67024] disabled:cursor-not-allowed disabled:bg-[#a9b1b8]"
        >
          {isAnalyzing ? "Analizando..." : "Buscar repuesto"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-[4px] bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-[6px] border border-black/10 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
          <div className="flex gap-4">
            <Image
              src={displayedProduct.imagen}
              alt={displayedProduct.nombre}
              width={96}
              height={96}
              className="h-24 w-24 shrink-0 rounded-[4px] object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                {displayedProduct.nombre}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b8d91]">
                {result.categoria}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold text-[#16384f]">
                  Coincidencia {result.confianza}%
                </span>
                <span className="rounded-full bg-[#eff8f0] px-3 py-1 text-[11px] font-semibold text-[#2d7b48]">
                  {displayedProduct.disponibilidad}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6d737a]">
                {result.razon}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/producto/${displayedProduct.slug}`}
              onClick={onNavigate}
              className="rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2a3b]"
            >
              Ver producto
            </Link>
            <Link
              href={categoryUrl}
              onClick={onNavigate}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
            >
              Ver categoría
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
