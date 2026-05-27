import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./Login.css";
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, Heart, ArrowRight } from "lucide-react";

const ELYSIA_QUOTES = [
  {
    id: 1,
    text: "Halo! Selamat datang di Elysia App~ Semoga harimu dipenuhi kebahagiaan! 🌸",
    lang: "id"
  },
  {
    id: 2,
    text: "Fun Fact: Karakter Elysia didesain dengan tema bunga Dianthus dan kristal merah muda yang melambangkan keindahan abadi. ✨",
    lang: "id"
  },
  {
    id: 3,
    text: "爱莉希雅最喜欢甜食和美丽的事物了！今天也要开心哦~ 💖",
    lang: "zh"
  },
  {
    id: 4,
    text: "Tahu tidak? Elysia adalah Herrscher of Human: Ego yang sangat mencintai kemanusiaan! 💕",
    lang: "id"
  },
  {
    id: 5,
    text: "有趣的事实：爱莉希雅的原型是俄罗斯，而制作她的公司却是一家中国公司 🇨🇳✨",
    lang: "zh"
  },
  {
    id: 6,
    text: "Hello there! Remember: Love is the beginning of everything! Have fun reading today~ 💖",
    lang: "en"
  }
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const { t, i18n } = useTranslation();
  const { toast } = useToastContext();

  // Cycle quotes on hover/click or timer
  const handleQuoteCycle = () => {
    setWiggle(true);
    setQuoteIndex((prev) => (prev + 1) % ELYSIA_QUOTES.length);
    setTimeout(() => setWiggle(false), 600);
  };

  useEffect(() => {
    // Filter initial quote based on current language
    const currentLang = i18n.language || 'id';
    const index = ELYSIA_QUOTES.findIndex(q => q.lang === currentLang);
    if (index !== -1) {
      setQuoteIndex(index);
    }
  }, [i18n.language]);

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('toast.fields-empty') || "Email dan kata sandi harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(t('toast.Login-success'));
        setTimeout(() => {
          if (user.role === "ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/home";
          }
        }, 1200);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('toast.Login-failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Magical Floating Crystals & Background Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="crystal-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`crystal-shard shard-${i + 1}`} />
        ))}
      </div>

      <div className="login-container">
        {/* Left Side: Elegant Character & Mascot Panel (Desktop Only) */}
        <div className="login-visual-panel">
          <div className="visual-background-overlay" />

          <div className="visual-avatar-ring">
            <img
              src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779721351/WhatsApp_Image_2026-05-25_at_23.01.24_q65fkc.jpg"
              alt="Elysia Portrait"
              className="visual-avatar-img"
              onError={(e) => {
                // Fallback elegant SVG if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="mascot-section">
            {/* Interactive Speech Bubble */}
            <div className="speech-bubble-container" onClick={handleQuoteCycle}>
              <div className="speech-bubble-content">
                <p className="quote-text">{ELYSIA_QUOTES[quoteIndex].text}</p>
                <div className="speech-bubble-tip" />
              </div>
            </div>

            {/* Elysia Chibi Mascot */}
            <div
              className={`chibi-mascot-wrapper ${wiggle ? 'wiggle' : ''}`}
              onClick={handleQuoteCycle}
              title="Click me for a fun fact!🌸"
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

        {/* Right Side: High-fidelity Glassmorphism Login Card */}
        <div className="login-card-container">
          <div className="login-header">
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

          <form className="login-form-premium" onSubmit={handleMasuk}>
            {/* Username/Email Input Group */}
            <div className="input-group-premium">
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
              </div>
              <input
                className="input-field-premium"
                type="text"
                placeholder="Email / Nama Pengguna"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
              <span className="input-highlight-line" />
            </div>

            {/* Password Input Group */}
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
                autoComplete="current-password"
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

            {/* Action Button */}
            <button className="btn-masuk-premium" type="submit" disabled={loading}>
              {loading ? (
                <div className="btn-loader-content">
                  <div className="crystal-spinner" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="btn-text-content">
                  <span>{t('auth.loginBtn') || "Masuk"}</span>
                  <ArrowRight size={18} className="arrow-icon" />
                </div>
              )}
            </button>
          </form>

          {/* Links section */}
          <div className="auth-links-premium">
            <a href="/auth/lupa-kata-sandi" className="link-hover-effect">
              Lupa Kata Sandi?
            </a>
            <span className="link-bullet">•</span>
            <a href="/register" className="link-hover-effect link-highlight">
              Daftar Akun
            </a>
          </div>

          {/* Mobile Mascot Assistant (Shown only on small screens) */}
          <div className="mobile-mascot-helper" onClick={handleQuoteCycle}>
            <div className="mobile-bubble">
              <p>{ELYSIA_QUOTES[quoteIndex].text}</p>
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