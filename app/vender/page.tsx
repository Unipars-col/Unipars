import type { Metadata } from "next";
import SellFlow from "./sell-flow";

export const metadata: Metadata = {
  title: "Vender | Unipars",
  description:
    "Publica y ofrece repuestos para transporte masivo en Unipars.",
};

export default function VenderPage() {
  return <SellFlow />;
}
