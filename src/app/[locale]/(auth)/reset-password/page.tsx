"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError(t("minLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }
    if (!token) {
      setError(t("invalidToken"));
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.resetPassword({
        newPassword,
        token,
      } as Parameters<typeof authClient.resetPassword>[0]);
      if (res.error) {
        setError(t("invalidToken"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("invalidToken"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center p-8">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-bold text-[var(--text)]">{t("invalidToken")}</p>
          <Link
            href="/login"
            className="mt-4 inline-block text-[var(--zkawi-pink)] font-bold"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo
            size={48}
            showText
            textClassName="text-2xl"
            className="justify-center mb-4"
          />
          <h1 className="text-2xl font-black text-[var(--text)]">
            {t("title")}
          </h1>
          <p className="text-[var(--text-muted)] mt-1">{t("subtitle")}</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] border border-[var(--zkawi-green)]/30 rounded-3xl p-8 text-center"
          >
            <CheckCircle2
              size={52}
              className="mx-auto mb-4 text-[var(--zkawi-green)]"
            />
            <h2 className="text-xl font-black text-[var(--text)] mb-2">
              {t("success")}
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              {t("successSubtitle")}
            </p>
            <Link href="/login">
              <Button className="w-full">{t("goToLogin")}</Button>
            </Link>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 flex flex-col gap-5"
          >
            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--text)]">
                {t("newPassword")}
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--text)]">
                {t("confirmPassword")}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? t("submitting") : t("submit")}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
