"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";

function parsePrice(precio: string): number {
  const n = Number(precio.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const DRAWER_WIDTH = 380;

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    lastAddedItem,
    closeDrawer,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();

  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  if (!mounted) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.precio) * item.cantidad,
    0,
  );

  const handleContinuar = async () => {
    setCheckingAuth(true);
    closeDrawer();
    try {
      const res = await fetch("/api/account", { credentials: "include" });
      router.push(res.ok ? "/checkout" : "/login?next=/checkout");
    } catch {
      router.push("/login?next=/checkout");
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <>
      {/* Overlay — click para cerrar */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          backgroundColor: "rgba(0,0,0,0.45)",
          transition: "opacity 0.3s",
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? "auto" : "none",
        }}
      />

      {/* Panel lateral derecho */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 301,
          width: `min(${DRAWER_WIDTH}px, 100vw)`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          boxShadow: "-4px 0 32px rgba(15,23,42,0.18)",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#8b8d91", margin: 0 }}>
              Tu carrito
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#16384f", margin: "2px 0 0" }}>
              {items.length === 0
                ? "Vacío"
                : `${items.reduce((s, i) => s + i.cantidad, 0)} producto${items.reduce((s, i) => s + i.cantidad, 0) !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "transparent",
              cursor: "pointer",
              color: "#4f545a",
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Banner "agregado" ── */}
        {lastAddedItem && items.length > 0 && (
          <div style={{
            margin: "12px 16px 0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid rgba(26,138,61,0.2)",
            backgroundColor: "#f0faf3",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: "rgba(26,138,61,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "#1a8a3d",
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#1a8a3d", margin: 0 }}>¡Agregado al carrito!</p>
              <p style={{ fontSize: 11, color: "#2d7b48", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastAddedItem.nombre}</p>
            </div>
          </div>
        )}

        {/* ── Lista de ítems (scrollable) ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#a0a6ae" }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: "#4f545a" }}>Tu carrito está vacío</p>
              <Link
                href="/categorias"
                onClick={closeDrawer}
                style={{ marginTop: 14, padding: "10px 22px", borderRadius: 999, backgroundColor: "#ed8435", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block" }}
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 16,
                  border: "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: "#fff",
                }}>
                  {/* Imagen */}
                  <div style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: "#f8f8f7", flexShrink: 0, overflow: "hidden" }}>
                    <Image src={item.imagen} alt={item.nombre} width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2328", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.nombre}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#ed8435", margin: "4px 0 8px" }}>
                      {item.precio}
                    </p>
                    {/* Cantidad */}
                    <div style={{ display: "inline-flex", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                      <button type="button" onClick={() => decrementItem(item.id)}
                        style={{ width: 28, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#4f545a", background: "none", border: "none", cursor: "pointer" }}>
                        −
                      </button>
                      <span style={{ width: 30, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1f2328", borderLeft: "1px solid rgba(0,0,0,0.10)", borderRight: "1px solid rgba(0,0,0,0.10)" }}>
                        {item.cantidad}
                      </span>
                      <button type="button" onClick={() => incrementItem(item.id)}
                        style={{ width: 28, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#4f545a", background: "none", border: "none", cursor: "pointer" }}>
                        +
                      </button>
                    </div>
                  </div>

                  {/* Quitar */}
                  <button type="button" onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.nombre}`}
                    style={{ alignSelf: "flex-start", padding: 4, background: "none", border: "none", cursor: "pointer", color: "#b0b6be" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            padding: "16px 20px 20px",
          }}>
            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: "#6e7379" }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#16384f" }}>{formatCOP(subtotal)}</span>
            </div>
            <p style={{ fontSize: 11, color: "#a0a6ae", textAlign: "center", margin: "6px 0 14px" }}>
              Envío calculado al finalizar la compra
            </p>

            {/* Botones */}
            <button
              type="button"
              onClick={handleContinuar}
              disabled={checkingAuth}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#ed8435",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: checkingAuth ? "not-allowed" : "pointer",
                opacity: checkingAuth ? 0.7 : 1,
                marginBottom: 10,
              }}
            >
              {checkingAuth ? "Verificando..." : "Continuar compra →"}
            </button>

            <Link
              href="/carrito"
              onClick={closeDrawer}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "1px solid rgba(22,56,79,0.2)",
                color: "#16384f",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            >
              Ver carrito completo
            </Link>

            <button
              type="button"
              onClick={closeDrawer}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "transparent",
                color: "#6e7379",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
