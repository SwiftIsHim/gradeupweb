import type { Metadata } from "next";

import { LoginPanel } from "@/src/login/view/login-panel";
import { ResetPasswordForm } from "@/src/reset-password/view/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password — Grade Up",
  description: "Choose a new password for your Grade Up account.",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <LoginPanel />
      <ResetPasswordForm token={token} />
    </div>
  );
}
