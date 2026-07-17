import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "../supabase.js"
import { useTheme } from "../context/ThemeContext.jsx"

const EMEL_AKAUN = "hazim.eduhub@gmail.com"

function Login() {
  const { C } = useTheme()
  const [password, setPassword] = useState("")
  const [tunjukPassword, setTunjukPassword] = useState(false)
  const [ralat, setRalat] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!password) return setRalat("Sila masuk kata laluan.")
    setLoading(true)
    setRalat("")
    const { error } = await supabase.auth.signInWithPassword({ email: EMEL_AKAUN, password })
    setLoading(false)
    if (error) {
      if (error.message === "Invalid login credentials") setRalat("Kata laluan salah.")
      else if (error.status === 429 || /rate limit/i.test(error.message)) setRalat("Terlalu banyak percubaan — sila tunggu sebentar dan cuba lagi.")
      else setRalat(error.message || "Gagal log masuk.")
    }
  }

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

        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type={tunjukPassword ? "text" : "password"}
            placeholder="Kata Laluan"
            value={password}
            autoFocus
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
      </form>
    </div>
  )
}

export default Login
