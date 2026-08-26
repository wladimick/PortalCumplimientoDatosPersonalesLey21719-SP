import { LoginForm } from "@/components/auth/login-form";
import { TiboxBrand } from "@/components/brand/tibox-brand";

export default function LoginPage() {
  return (
    <main className="login-minimal">
      <div className="login-brand-top"><TiboxBrand /></div>
      <section className="login-card">
        <h1>Bienvenido a TIBOX Compliance</h1>
        <LoginForm />
      </section>
    </main>
  );
}
