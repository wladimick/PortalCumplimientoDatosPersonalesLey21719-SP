"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) { setError("No pudimos iniciar sesión. Revisa el correo y la contraseña."); setLoading(false); return; }
    router.replace("/app"); router.refresh();
  }

  async function sendMagicLink() {
    if (!email.trim()) { setError("Ingresa tu correo para recibir el enlace de acceso."); return; }
    setLoading(true); setError(null); setMessage(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${origin}/auth/callback?next=/app` },
    });
    if (otpError) setError("No pudimos enviar el enlace de acceso.");
    else setMessage("Revisa tu correo. Si estás autorizado para una organización, podrás ingresar desde el enlace.");
    setLoading(false);
  }

  return (
    <form onSubmit={handlePassword} className="login-form">
      <div className="field"><label htmlFor="email">Correo</label><input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.cl" required /></div>
      <div className="field"><label htmlFor="password">Contraseña</label><input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></div>
      <button className="btn btn-primary btn-block" type="submit" disabled={loading || !password}><LogIn size={18} />{loading ? "Ingresando…" : "Ingresar"}</button>
      <button className="btn btn-secondary btn-block" type="button" onClick={sendMagicLink} disabled={loading}><Mail size={18} />Enviar enlace de acceso</button>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      {message ? <div className="form-success" role="status">{message}</div> : null}
    </form>
  );
}
