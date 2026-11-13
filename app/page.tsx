import type { Metadata } from "next";
import { Library } from "@/components/library";

export const metadata: Metadata = {
  // title.template del layout no aplica al segmento raíz: se escribe completo.
  title: "Biblioteca · Arcade Vault",
};

export default function Home() {
  return <Library />;
}
