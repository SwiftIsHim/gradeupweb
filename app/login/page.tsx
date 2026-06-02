import type { Metadata } from "next";

import { LoginForm } from "@/src/login/view/login-form";
import { LoginPanel } from "@/src/login/view/login-panel";

export const metadata: Metadata = {
  title: "Log in — Grade Up",
  description: "Pick up exactly where you left off.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <LoginPanel />
      <LoginForm />
    </div>
  );
}
