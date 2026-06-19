"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

export default function PopupAliado() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageSrc, setImageSrc] = useState("/servicio-reparacion/popup-uniparceros.png");

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 800);
    fetch("/api/site-images")
      .then((r) => r.json())
      .then((d: Record<string, string>) => { if (d["popup-uniparceros"]) setImageSrc(d["popup-uniparceros"]); })
      .catch(() => {});
    return () => clearTimeout(t);
  }, []);

  function cerrar() {
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        width: "100vw", height: "100vh",
        zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={cerrar}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "popupIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="/registro-aliado" onClick={cerrar}>
          <Image
            src={imageSrc}
            alt="Únete a Uniparceros"
            width={600}
            height={600}
            style={{ width: "100%", height: "auto", display: "block", cursor: "pointer" }}
            priority
          />
        </Link>

        <button
          onClick={cerrar}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 36, height: 36,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
