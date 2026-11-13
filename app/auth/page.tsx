import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm, AuthFormFromQuery } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Acceso",
};

export default function AuthPage() {
  // useSearchParams se renderiza en el cliente; el fallback prerenderiza el formulario en "INICIAR SESIÓN".
  return (
    <Suspense fallback={<AuthForm />}>
      <AuthFormFromQuery />
    </Suspense>
  );
}
