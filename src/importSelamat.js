// Selepas deployment baru, tab yang dah lama terbuka akan cuba fetch chunk JS
// dengan nama hash lama yang dah tak wujud di server ("Failed to fetch dynamically
// imported module"). Reload sekali secara automatik biasanya menyelesaikannya
// sebab index.html yang baru akan rujuk hash yang betul.
const KEY = "_minbar_reload_lepas_ralat_import"

export function importSelamat(loader) {
  return loader().catch(err => {
    if (!sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, "1")
      window.location.reload()
      return new Promise(() => {}) // page akan reload — jangan resolve/reject
    }
    throw err
  })
}
