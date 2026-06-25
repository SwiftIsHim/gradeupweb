import type { Metadata } from "next";

import { LoginForm } from "@/src/login/view/login-form";
import { LoginPanel } from "@/src/login/view/login-panel";

export const metadata: Metadata = {
  title: "Sign up — Grade Up",
  description: "Create your account and build a study plan that fits your week.",
};

/**
 * Sign-up entry point. The auth flow is email-first and detects new vs.
 * returning accounts automatically, so this renders the same two-panel form as
 * /login — a new email lands on the signup fields, an existing one on login.
 */
export default function SignupPage() {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <LoginPanel />
      <LoginForm />
    </div>
  );
}
