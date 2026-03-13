import AuthTransition from "@/components/AuthTransition";
import { LoginRegisterView } from "@/components/auth/LoginRegisterView";

export default function LoginPage() {
  return (
    <AuthTransition>
      <LoginRegisterView />
    </AuthTransition>
  );
}