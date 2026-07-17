import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "../supabase.js"
import { useTheme } from "../context/ThemeContext.jsx"

function ResetPassword({ onSiap }) {
  const { C } = useTheme()
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [tunjukPassword, setTunjukPassword] = useState(false)
  const [ralat, setRalat] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSet(e) {
    e.preventDefault()
    if (!password || !password2) return setRalat("Sila isi kedua-dua ruangan kata laluan.")
    if (password.length < 6) return setRalat("Kata laluan mesti sekurang-kurangnya 6 aksara.")
    if (password !== password2) return setRalat("Kata laluan tidak sepadan.")
    setLoading(true)
    setRalat("")
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setRalat(error.message || "Gagal mengemaskini kata laluan.")
    else onSiap()
  }

  return (
    <div style={{
      minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: `linear-gradient(145deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
    }}>
      <form onSubmit={handleSet} style={{
        background: C.card, padding: "36px 28px", borderRadius: 20,
        textAlign: "center", width: "100%", maxWidth: 320, boxShadow: C.shadowMd,
      }}>
        <h2 style={{ color: C.navy, fontSize: 22, fontWeight: "800", marginBottom: 4 }}>Set Kata Laluan Baru</h2>
        <p style={{ color: C.txtMuted, fontSize: 13, marginBottom: 28 }}>Masukkan kata laluan baru untuk akaun anda.</p>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type={tunjukPassword ? "text" : "password"}
            placeholder="Kata Laluan Baru"
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

        <input
          type={tunjukPassword ? "text" : "password"}
          placeholder="Sahkan Kata Laluan Baru"
          value={password2}
          onChange={e => { setPassword2(e.target.value); setRalat("") }}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8, fontSize: 14, boxSizing: "border-box" }}
        />

        {ralat && <p style={{ color: C.danger, fontSize: 13, marginBottom: 8 }}>{ralat}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 12, borderRadius: 10, border: "none",
          background: C.navy, color: "white", fontSize: 14, fontWeight: "700",
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4,
        }}>
          {loading ? "Menyimpan…" : "Simpan Kata Laluan"}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
