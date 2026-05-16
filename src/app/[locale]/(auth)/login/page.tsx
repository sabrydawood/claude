"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { isRTL } from "@/lib/i18n/locale-utils";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { signIn } from "@/lib/auth-client";
import {
  Mail,
  Lock,
  Home,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Rocket,
  GraduationCap,
  Zap,
  CheckCircle2,
} from "lucide-react";

// Floating decorative icons (crisp at all sizes, theme-aware)
const FLOATERS = [
  { Icon: Star, top: "12%", left: "8%", size: 28, delay: 0, opacity: 0.12 },
  {
    Icon: Sparkles,
    top: "28%",
    right: "12%",
    size: 22,
    delay: 0.8,
    opacity: 0.1,
  },
  {
    Icon: GraduationCap,
    bottom: "18%",
    left: "20%",
    size: 26,
    delay: 1.6,
    opacity: 0.11,
  },
  {
    Icon: Rocket,
    top: "60%",
    right: "28%",
    size: 20,
    delay: 0.4,
    opacity: 0.09,
  },
  { Icon: Zap, top: "42%", left: "5%", size: 18, delay: 1.2, opacity: 0.1 },
] as const;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tVal = useTranslations("auth.validation");
  const tErr = useTranslations("auth.errors");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          redirectTo: `${origin}/${locale}/reset-password`,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setForgotDone(true);
    } catch {
      setForgotError(t("forgotError"));
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = tVal("emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = tVal("emailInvalid");
    if (!password) e.password = tVal("passwordRequired");
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) setApiError(tErr("invalidCredentials"));
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setApiError(tErr("generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative icons — always rendered, opacity toggled to avoid hydration mismatch */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}
      >
        {FLOATERS.map(({ Icon, size, delay, opacity, ...pos }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ ...pos, color: "var(--zkawi-pink)", opacity }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3.5 + i * 0.4,
              delay,
              ease: "easeInOut",
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        ))}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Back to home */}
      <motion.div
        initial={{ opacity: 0, x: isRTL(locale) ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-5 start-5"
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <Home size={15} />
            {tNav("home")}
          </motion.button>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", damping: 20 }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 25px 60px rgba(109,40,217,0.15)",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[var(--zkawi-pink)] via-indigo-600 to-pink-800 p-8 text-center text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -start-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -end-4 w-20 h-20 rounded-full bg-white/5" />

            <Link href="/" className="inline-block mb-4 relative z-10">
              <Logo size={44} showText textClassName="text-2xl text-white" />
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-black mb-1 relative z-10"
            >
              {t("title")}
            </motion.h1>
            <p className="text-pink-200 text-sm relative z-10">
              {t("subtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "var(--zkawi-red)",
                }}
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {apiError}
              </motion.div>
            )}

            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--text)" }}
              >
                {t("email")}
              </label>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail size={16} />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {t("password")}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotDone(false);
                    setForgotError("");
                  }}
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--zkawi-pink)" }}
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <Input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={16} />}
              />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                loading={loading}
              >
                <Rocket size={16} />
                {loading ? t("loading") : t("submit")}
              </Button>
            </motion.div>

            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {t("noAccount")}{" "}
              <Link
                href="/register"
                className="font-bold hover:opacity-75 transition-opacity"
                style={{ color: "var(--zkawi-pink)" }}
              >
                {t("register")}
              </Link>
            </p>
          </form>
        </div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-1.5 mt-5 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <ShieldCheck size={13} style={{ color: "var(--zkawi-green)" }} />
          {t("dataSecure")}
        </motion.div>
      </motion.div>

      {/* Forgot password modal */}
      {showForgot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowForgot(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl p-8"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {forgotDone ? (
              <div className="text-center">
                <CheckCircle2
                  size={48}
                  className="mx-auto mb-4 text-[var(--zkawi-green)]"
                />
                <h3 className="font-black text-[var(--text)] text-lg mb-2">
                  {t("forgotSuccess")}
                </h3>
                <button
                  onClick={() => setShowForgot(false)}
                  className="mt-4 text-sm font-bold"
                  style={{ color: "var(--zkawi-pink)" }}
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="flex flex-col gap-4">
                <div>
                  <h3 className="font-black text-[var(--text)] text-lg mb-1">
                    {t("forgotTitle")}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {t("forgotSubtitle")}
                  </p>
                </div>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  icon={<Mail size={16} />}
                  required
                />
                {forgotError && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle size={12} />
                    {forgotError}
                  </div>
                )}
                <Button
                  type="submit"
                  loading={forgotLoading}
                  className="w-full"
                >
                  {forgotLoading ? t("forgotSending") : t("forgotSend")}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
