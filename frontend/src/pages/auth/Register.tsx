import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./Register.css";
import { useToastContext } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { User, Mail, UserCheck, Lock, Eye, EyeOff, Sparkles, Heart, ArrowRight } from "lucide-react";

const ELYSIA_REGISTER_QUOTES = [
  {
    id: 1,
    text: "Halo! Aku sangat senang kamu ingin bergabung menjadi bagian dari petualangan kita! Yuk, buat akunmu sekarang~ 💖",
    lang: "id"
  },
  {
    id: 2,
    text: "Fun Fact: Elysia selalu menyambut teman baru dengan senyuman terhangat! Jangan lupa isi semua kolom dengan benar ya~ 🌸",
    lang: "id"
  },
  {
    id: 3,
    text: "请输入您的信息来注册新账号！爱莉希雅非常期待与您开启新的篇章~ ✨",
    lang: "zh"
  },
  {
    id: 4,
    text: "Pro tip: Gunakan kata sandi yang kuat agar akunmu selalu aman terlindungi oleh kristalku! 💎💕",
    lang: "id"
  },
  {
    id: 5,
    text: "Welcome! Let's fill out these boxes and start exploring our endless library of wonders! 📖✨",
    lang: "en"
  }
];

export default function Register() {
  const { t, i18n } = useTranslation();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const { toast } = useToastContext();

  const handleQuoteCycle = () => {
    setWiggle(true);
    setQuoteIndex((prev) => (prev + 1) % ELYSIA_REGISTER_QUOTES.length);
    setTimeout(() => setWiggle(false), 600);
  };

  useEffect(() => {
    const currentLang = i18n.language || 'id';
    const index = ELYSIA_REGISTER_QUOTES.findIndex(q => q.lang === currentLang);
    if (index !== -1) {
      setQuoteIndex(index);
    }
  }, [i18n.language]);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama || !email || !username || !password || !konfirmasi) {
      toast.error("Semua kolom harus diisi!");
      return;
    }

    if (password !== konfirmasi) {
      toast.error(t("toast.confirm-error-password") || "Kata sandi dan konfirmasi kata sandi tidak cocok!");
      return;
    }

    if (password.length < 6) {
      toast.error("Kata sandi minimal harus 6 karakter!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: nama.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password: password,
      });

      if (response.data.success) {
        toast.success(t("toast.Account-added") || "Akun berhasil didaftarkan!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      const message = error.response?.data?.message || t("toast.register-failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Background blobs & crystals */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="crystal-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`crystal-shard shard-${i + 1}`} />
        ))}
      </div>

      <div className="register-container">
        {/* Left Side: Visual Mascot Panel (Desktop) */}
        <div className="register-visual-panel">
          <div className="visual-background-overlay" />

          <div className="visual-avatar-ring">
            <img
              src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779721351/WhatsApp_Image_2026-05-25_at_23.01.24_q65fkc.jpg"
              alt="Elysia Portrait"
              className="visual-avatar-img"
            />
          </div>

          <div className="mascot-section">
            {/* Interactive Speech Bubble */}
            <div className="speech-bubble-container" onClick={handleQuoteCycle}>
              <div className="speech-bubble-content">
                <p className="quote-text">{ELYSIA_REGISTER_QUOTES[quoteIndex].text}</p>
                <div className="speech-bubble-tip" />
              </div>
            </div>

            {/* Chibi mascot */}
            <div
              className={`chibi-mascot-wrapper ${wiggle ? 'wiggle' : ''}`}
              onClick={handleQuoteCycle}
              title="Click me for a sweet note!🌸"
            >
              <img
                src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720328/250_wolupe.png"
                alt="Elysia Chibi"
                className="chibi-image"
              />
              <div className="chibi-shadow" />
            </div>
          </div>
        </div>

        {/* Right Side: High-fidelity Glassmorphism Card */}
        <div className="register-card-container">
          <div className="register-header">
            <div className="mobile-logo-header">
              <div className="logo-ring-mini">
                <img
                  src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720330/part-four-traced-even-more-symbol-and-stigmata-from-honkai-v0-bwybasca0sc71_png_q0mbsq.png"
                  alt="Elysia Logo"
                  className="logo-img-mini"
                />
              </div>
            </div>

            <h1 className="app-title-premium">
              Elysia App <span className="title-sparkle"><Sparkles size={16} /></span>
            </h1>
          </div>

          <form className="register-form-premium" onSubmit={handleDaftar}>
            {/* Full Name field */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type="text"
                placeholder="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                autoComplete="name"
                required
                disabled={loading}
              />
              <span className="input-highlight-line" />
            </div>

            {/* Email Address field */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type="email"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
              <span className="input-highlight-line" />
            </div>

            {/* Username field */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <UserCheck size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type="text"
                placeholder="Nama Pengguna (Username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
              <span className="input-highlight-line" />
            </div>

            {/* Password field */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type={showPassword ? "text" : "password"}
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <span className="input-highlight-line" />
            </div>

            {/* Confirm Password field */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type={showConfirm ? "text" : "password"}
                placeholder="Konfirmasi Kata Sandi"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <span className="input-highlight-line" />
            </div>

            {/* Submit button */}
            <button className="btn-daftar-premium" type="submit" disabled={loading}>
              {loading ? (
                <div className="btn-loader-content">
                  <div className="crystal-spinner" />
                  <span>Mendaftarkan...</span>
                </div>
              ) : (
                <div className="btn-text-content">
                  <span>{t('auth.registerBtn') || "Buat Akun"}</span>
                  <ArrowRight size={18} className="arrow-icon" />
                </div>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="auth-links-premium">
            <span className="links-text-label">{t('auth.hasAccount') || "Sudah punya akun?"}</span>
            <a href="/login" className="link-hover-effect link-highlight">
              {t('auth.loginLink') || "Masuk"}
            </a>
          </div>

          {/* Decorative flower emblem at bottom (from mockup) */}
          <div className="form-bottom-emblem-container">
            <img
              src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720330/part-four-traced-even-more-symbol-and-stigmata-from-honkai-v0-bwybasca0sc71_png_q0mbsq.png"
              alt="Elysia Flower Emblem"
              className="bottom-emblem-flower"
            />
          </div>

          {/* Mobile Mascot Helper */}
          <div className="mobile-mascot-helper" onClick={handleQuoteCycle}>
            <div className="mobile-bubble">
              <p>{ELYSIA_REGISTER_QUOTES[quoteIndex].text}</p>
            </div>
            <img
              src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720328/250_wolupe.png"
              alt="Elysia Chibi Mobile"
              className={`mobile-chibi-img ${wiggle ? 'wiggle' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}