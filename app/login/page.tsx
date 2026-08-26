import { LoginForm } from "@/components/auth/login-form";
import { TiboxBrand } from "@/components/brand/tibox-brand";

export default function LoginPage() {
  return (
    <main className="login-split-shell">
      <aside className="login-story-panel" aria-label="TIBOX Compliance">
        <div className="login-story-inner">
          <TiboxBrand light />

          <div className="login-story-copy">
            <span className="login-story-kicker">Ley N° 21.719</span>
            <h1>Protección de datos, bajo control.</h1>
            <p>
              Centraliza cumplimiento, evidencias y seguimiento en un espacio claro para tu organización.
            </p>
          </div>

          <div className="login-story-footer">Plataforma de cumplimiento TIBOX</div>
        </div>
      </aside>

      <section className="login-access-panel" aria-label="Inicio de sesión">
        <div className="login-access-wrap">
          <div className="login-mobile-brand"><TiboxBrand /></div>

          <section className="login-card">
            <header className="login-card-header">
              <span className="login-card-eyebrow">Acceso seguro</span>
              <h1>Bienvenido</h1>
              <p>Ingresa con tu cuenta para acceder a TIBOX Compliance.</p>
            </header>
            <LoginForm />
          </section>

          <p className="login-access-note">TIBOX Compliance · Protección de Datos Personales</p>
        </div>
      </section>
    </main>
  );
}
