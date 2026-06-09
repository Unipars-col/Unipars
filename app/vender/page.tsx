import type { Metadata } from "next";
import SellFlow from "./sell-flow";
import PopupProveedor from "./popup-proveedor";

export const metadata: Metadata = {
  title: "Vender | Totalpars",
  description:
    "Publica y ofrece repuestos para transporte masivo en Totalpars.",
};

export default function VenderPage() {
  return (
    <>
      <PopupProveedor />
      <SellFlow />
    </>
  );
}
