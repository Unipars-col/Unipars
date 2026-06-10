"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HoverCartControl from "./hover-cart-control";

type Props = {
  slug: string;
  nombre: string;
  marca: string;
  descripcion: string;
  imagen: string;
  precio: string;
  precioAnterior: string;
  descuento: string;
  stock: number;
  puedeComprar: boolean;
};

export default function FeaturedProductCard(props: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="featured-card"
      style={{
        borderRadius: "1.75rem",
        background: "white",
        border: hovered ? "2px solid #ed8435" : "2px solid transparent",
        boxShadow: hovered
          ? "0 32px 72px rgba(237,132,53,0.45), 0 0 0 6px rgba(237,132,53,0.12)"
          : "0 8px 24px rgba(15,23,42,0.08)",
        transform: hovered ? "translateY(-16px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Gradiente naranja en hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "linear-gradient(160deg, rgba(237,132,53,0.08) 0%, transparent 60%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
      }} />

      <div style={{ position: "relative", overflow: "hidden", borderRadius: "1.75rem 1.75rem 0 0" }}>
        <span style={{
          position: "absolute", left: 16, top: 16, zIndex: 10,
          background: "#ed8435", color: "white", borderRadius: 8,
          padding: "4px 10px", fontSize: 13, fontWeight: 600,
        }}>
          {props.descuento}
        </span>
        <div style={{ display: "flex", height: 208, alignItems: "center", justifyContent: "center", padding: "28px" }}>
          <Image
            src={props.imagen}
            alt={props.nombre}
            width={800}
            height={600}
            style={{
              maxHeight: 140, width: "auto", maxWidth: "100%", objectFit: "contain",
              transform: hovered ? "scale(1.18)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        </div>
        <HoverCartControl
          id={props.slug}
          nombre={props.nombre}
          precio={props.precio}
          imagen={props.imagen}
          disabled={!props.puedeComprar}
        />
      </div>

      <div style={{ position: "relative", padding: "20px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0, overflow: "hidden", flex: 1 }}>
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.25em", marginBottom: 6,
            color: hovered ? "#ed8435" : "#8b8d91",
            transition: "color 0.3s ease",
          }}>
            {props.marca}
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, color: "#4f545a", margin: 0, overflowWrap: "break-word" }}>
            {props.nombre}
          </h3>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#7b7f85", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {props.descripcion}
        </p>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#6e7379" }}>Stock: {props.stock ?? 0}</p>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
          <p style={{ fontSize: 13, color: "#a0a3a8", textDecoration: "line-through", marginBottom: 2 }}>{props.precioAnterior}</p>
          <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "#ed8435" }}>{props.precio}</p>
        </div>
        <Link
          href={`/producto/${props.slug}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 999, padding: "12px 20px",
            fontSize: 14, fontWeight: 600, textDecoration: "none",
            background: hovered ? "#ed8435" : "#16384f",
            color: "white",
            boxShadow: hovered ? "0 8px 24px rgba(237,132,53,0.45)" : "none",
            transition: "background 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}
