import { useState } from "react";
import api from "../../api/axios";
import "./Register.css";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== konfirmasi) {
      alert("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: nama,
        username: username,
        email: email,
        password: password,
      });

      if (response.data.success) {
        alert("Registrasi berhasil! Silakan masuk.");
        window.location.href = "/login"; // Redirect ke login
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      const message = error.response?.data?.message || "Terjadi kesalahan saat registrasi. Pastikan backend sudah berjalan.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="register-card">
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
        <h2 className="form-subtitle">Daftar Akun</h2>

        <form className="register-form" onSubmit={handleDaftar}>
          <div className="field-group">
            <input
              className="field-input"
              type="text"
              placeholder="Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="field-group">
            <input
              className="field-input"
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <input
              className="field-input"
              type="text"
              placeholder="Nama Pengguna"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              autoComplete="new-password"
            />
          </div>

          <div className="field-group">
            <input
              className="field-input"
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button className="btn-daftar" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Buat Akun"}
          </button>
        </form>

        <div className="links">
          <span className="link-text">Sudah punya akun?</span>
          <a href="/login" className="link-secondary">Masuk</a>
        </div>
      </div>
    </div>
  );
}