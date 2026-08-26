import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { TiboxBrand } from "@/components/brand/tibox-brand";

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-brand">
        <div>
          <div className="brand-strip" style={{ position: "absolute", inset: "0 0 auto" }} />
          <TiboxBrand light />
        </div>

        <div>
          <span className="eyebrow" style={{ color: "var(--tbx-cyan)" }}>Plataforma de cumplimiento</span>
          <h1>Convierte obligaciones en acciones verificables.</h1>
          <p>
            Centraliza avance, responsables, controles, evidencias y decisiones en una experiencia propia de TIBOX, preparada para operar con múltiples clientes.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#9ba6c4", fontSize: ".9rem" }}>
          <ShieldCheck size={18} />
          Acceso privado · datos segregados por organización
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">Acceso seguro</span>
          <h2>Bienvenido</h2>
          <p className="lead">Ingresa con el usuario creado para este piloto.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
