import type { Metadata } from "next";
import EmpresaForm from "./empresa-form";

export const metadata: Metadata = {
  title: "Registrar empresa | Unipars",
  description: "Completa el formulario para registrarte como vendedor en Unipars y empieza a publicar tus productos.",
};

export default function RegistroEmpresaPage() {
  return <EmpresaForm />;
}
