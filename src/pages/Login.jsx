import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "../supabase.js"
import { useTheme } from "../context/ThemeContext.jsx"

function Login() {
  const { C } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tunjukPassword, setTunjukPassword] = useState(false)
  const [ralat, setRalat] = useState("")
  const [loading, setLoading] = useState(false)
  const [modLupa, setModLupa] = useState(false)
  const [mesejLupa, setMesejLupa] = useState("")

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) return setRalat("Sila masuk emel dan kata laluan.")
    setLoading(true)
    setRalat("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      if (error.message === "Invalid login credentials") setRalat("Emel atau kata laluan salah.")
      else if (error.status === 429 || /rate limit/i.test(error.message)) setRalat("Terlalu banyak percubaan — sila tunggu sebentar dan cuba lagi.")
      else setRalat(error.message || "Gagal log masuk.")
    }
  }

  async function handleLupaPassword(e) {
    e.preventDefault()
    if (!email) return setRalat("Sila masuk emel anda dahulu.")
    setLoading(true)
    setRalat("")
    setMesejLupa("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    setLoading(false)
    if (error) {
      if (error.status === 429 || /rate limit/i.test(error.message)) setRalat("Terlalu banyak percubaan — sila tunggu sebentar dan cuba lagi.")
      else setRalat(error.message || "Gagal menghantar pautan reset.")
    } else {
      setMesejLupa("Jika emel ini berdaftar, pautan untuk set semula kata laluan telah dihantar. Sila semak peti masuk anda.")
    }
  }

  if (modLupa) return (
    <div style={{
      minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: `linear-gradient(145deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
    }}>
      <form onSubmit={handleLupaPassword} style={{
        background: C.card, padding: "36px 28px", borderRadius: 20,
        textAlign: "center", width: "100%", maxWidth: 320, boxShadow: C.shadowMd,
      }}>
        <h2 style={{ color: C.navy, fontSize: 22, fontWeight: "800", marginBottom: 4 }}>Lupa Kata Laluan</h2>
        <p style={{ color: C.txtMuted, fontSize: 13, marginBottom: 28 }}>Masukkan emel anda untuk terima pautan set semula.</p>

        <input
          type="email"
          placeholder="Emel"
          value={email}
          autoFocus
          onChange={e => { setEmail(e.target.value); setRalat(""); setMesejLupa("") }}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box" }}
        />

        {ralat && <p style={{ color: C.danger, fontSize: 13, marginBottom: 8 }}>{ralat}</p>}
        {mesejLupa && <p style={{ color: C.green, fontSize: 13, marginBottom: 8 }}>{mesejLupa}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 12, borderRadius: 10, border: "none",
          background: C.navy, color: "white", fontSize: 14, fontWeight: "700",
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4,
        }}>
          {loading ? "Menghantar…" : "Hantar Pautan Reset"}
        </button>

        <button type="button" onClick={() => { setModLupa(false); setRalat(""); setMesejLupa("") }} style={{
          width: "100%", padding: 10, borderRadius: 10, border: "none", background: "none",
          color: C.txtMuted, fontSize: 13, cursor: "pointer", marginTop: 8,
        }}>
          Kembali ke Log Masuk
        </button>
      </form>
    </div>
  )

  return (
    <div style={{
      minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: `linear-gradient(145deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
    }}>
      <form onSubmit={handleLogin} style={{
        background: C.card, padding: "36px 28px", borderRadius: 20,
        textAlign: "center", width: "100%", maxWidth: 320, boxShadow: C.shadowMd,
      }}>
        <h2 style={{ color: C.navy, fontSize: 22, fontWeight: "800", marginBottom: 4 }}>Minbar</h2>
        <p style={{ color: C.txtMuted, fontSize: 13, marginBottom: 28 }}>Pentadbiran Biro Pendidikan</p>

        <input
          type="email"
          placeholder="Emel"
          value={email}
          autoFocus
          onChange={e => { setEmail(e.target.value); setRalat("") }}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box" }}
        />
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type={tunjukPassword ? "text" : "password"}
            placeholder="Kata Laluan"
            value={password}
            onChange={e => { setPassword(e.target.value); setRalat("") }}
            style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
          />
          <button type="button" onClick={() => setTunjukPassword(v => !v)} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 4, color: C.txtMuted, display: "flex",
          }}>
            {tunjukPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {ralat && <p style={{ color: C.danger, fontSize: 13, marginBottom: 8 }}>{ralat}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 12, borderRadius: 10, border: "none",
          background: C.navy, color: "white", fontSize: 14, fontWeight: "700",
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4,
        }}>
          {loading ? "Mengesahkan…" : "Log Masuk"}
        </button>

        <button type="button" onClick={() => { setModLupa(true); setRalat("") }} style={{
          width: "100%", padding: 10, borderRadius: 10, border: "none", background: "none",
          color: C.txtMuted, fontSize: 13, cursor: "pointer", marginTop: 4,
        }}>
          Lupa kata laluan?
        </button>
      </form>
    </div>
  )
}

export default Login
