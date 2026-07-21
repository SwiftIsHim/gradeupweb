import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/src/forgot-password/view/forgot-password-form";
import { LoginPanel } from "@/src/login/view/login-panel";

export const metadata: Metadata = {
  title: "Forgot password — Grade Up",
  description: "Reset the password on your Grade Up account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <LoginPanel />
      <ForgotPasswordForm />
    </div>
  );
}
