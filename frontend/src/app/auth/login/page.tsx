import { Suspense } from "react";
import { LoginRegisterView } from "@/components/auth/LoginRegisterView";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRegisterView initialMode="login" />
    </Suspense>
  );
}
