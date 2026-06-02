import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/src/login/view/login-panel";
import { VerifyForm } from "@/src/login/view/verify-form";
import { readVerificationCookie } from "@/lib/auth/cookies";

export const metadata: Metadata = {
  title: "Verify your code — Grade Up",
  description: "Enter the 6-digit code we just sent you.",
};

export default async function VerifyOtpPage() {
  const verificationToken = await readVerificationCookie();
  if (!verificationToken) {
    redirect("/login");
  }

  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <LoginPanel />
      <VerifyForm />
    </div>
  );
}
