import type { Metadata } from "next";
import EmpresaForm from "./empresa-form";

export const metadata: Metadata = {
  title: "Registrar empresa | Totalpars",
  description: "Completa el formulario para registrarte como vendedor en Totalpars y empieza a publicar tus productos.",
};

export default function RegistroEmpresaPage() {
  return <EmpresaForm />;
}
