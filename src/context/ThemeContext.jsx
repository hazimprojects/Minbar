import { createContext, useContext, useState, useEffect } from "react"
import { lightTheme, darkTheme } from "../constants/theme.js"

const STORAGE_KEY = "minbar_theme"
const ThemeContext = createContext(null)

function bacaModDisimpan() {
  try {
    const simpan = localStorage.getItem(STORAGE_KEY)
    if (simpan === "light" || simpan === "dark" || simpan === "system") return simpan
  } catch { /* abaikan */ }
  return "light"
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(bacaModDisimpan)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const resolvedTheme = mode === "system" ? (systemDark ? "dark" : "light") : mode
  const C = resolvedTheme === "dark" ? darkTheme : lightTheme

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme)
    document.body.style.background = C.bg
  }, [resolvedTheme, C.bg])

  function setMode(baruan) {
    setModeState(baruan)
    try { localStorage.setItem(STORAGE_KEY, baruan) } catch { /* abaikan */ }
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedTheme, C }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme mesti digunakan dalam ThemeProvider")
  return ctx
}
