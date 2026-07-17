import { useState, useEffect } from "react"
import { supabase } from "./supabase.js"
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx"
import Login from "./pages/Login.jsx"
import BiroPendidikan from "./pages/BiroPendidikan.jsx"
import LaporanBendahari from "./pages/LaporanBendahari.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"

function Termuat() {
  const { C } = useTheme()
  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.navy, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  )
}

function AppDalaman() {
  const [session, setSession] = useState(undefined) // undefined = belum semak, null = tiada sesi
  const [pemulihan, setPemulihan] = useState(false)
  const [bendahariToken] = useState(() => new URLSearchParams(window.location.search).get("bendahari"))

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setPemulihan(true)
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (bendahariToken) return (
    <LaporanBendahari token={bendahariToken} onAdminLogin={() => {
      window.history.replaceState({}, "", window.location.pathname)
      window.location.reload()
    }} />
  )
  if (session === undefined) return <Termuat />
  if (pemulihan) return <ResetPassword onSiap={() => {
    window.history.replaceState({}, "", window.location.pathname)
    setPemulihan(false)
  }} />
  if (!session) return <Login />

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <BiroPendidikan onKembali={() => supabase.auth.signOut()} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppDalaman />
    </ThemeProvider>
  )
}

export default App
