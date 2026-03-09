import AuthTransition from "@/components/AuthTransition";
import { RegisterView } from "@/components/auth/RegisterView";

export default function RegisterPage() {
  return (
    <AuthTransition>
      <RegisterView />
    </AuthTransition>
  );
}