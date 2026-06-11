import { Suspense } from "react";
import { LoginRegisterView } from "@/components/auth/LoginRegisterView";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <LoginRegisterView initialMode="register" />
    </Suspense>
  );
}
