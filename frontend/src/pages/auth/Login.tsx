import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: hubungkan ke backend auth
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="login-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="login-card">
        <div className="logo-ring">
          <div className="logo-inner">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              <path d="M32 8 C20 8 12 18 12 28 C12 42 24 52 32 56 C40 52 52 42 52 28 C52 18 44 8 32 8Z" fill="#f9a8d4" opacity="0.6"/>
              <path d="M32 14 C22 14 18 22 18 29 C18 39 26 47 32 50 C38 47 46 39 46 29 C46 22 42 14 32 14Z" fill="#fbcfe8"/>
              <ellipse cx="32" cy="30" rx="6" ry="8" fill="white" opacity="0.8"/>
              <circle cx="32" cy="24" r="3" fill="#f472b6"/>
            </svg>
          </div>
        </div>

        <h1 className="app-title">Elysia App</h1>
        <h2 className="form-subtitle">Masuk ke Akun</h2>

        <form className="login-form" onSubmit={handleMasuk}>
          <div className="field-group">
            <input
              className="field-input"
              type="text"
              placeholder="Email / Nama Pengguna"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <input
              className="field-input"
              type="password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn-masuk" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Masuk"}
          </button>
        </form>

        <div className="links">
          <a href="/auth/lupa-kata-sandi" className="link-secondary">Lupa Kata Sandi?</a>
          <span className="link-divider">·</span>
          <a href="register" className="link-secondary">Daftar Akun</a>
        </div>
      </div>
    </div>
  );
}