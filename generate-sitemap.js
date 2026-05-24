import { createRequire } from "module"
import { writeFileSync } from "fs"

const require = createRequire(import.meta.url)
const { WebSocket } = require("ws")
globalThis.WebSocket = WebSocket

const { connect } = await import("framer-api")

const PROJECT_URL = "https://framer.com/projects/Radar-Producci-n-Oficial--8sVNaZ05pi3UfzrQW6xz-8nLzy"
const DOMAIN = "https://www.somosradar.com"
const TODAY = new Date().toISOString().split("T")[0]

const STATIC_PAGES = [
  { path: "/",             priority: "1.0", changefreq: "weekly" },
  { path: "/conciliacion", priority: "0.8", changefreq: "monthly" },
  { path: "/payouts",      priority: "0.8", changefreq: "monthly" },
  { path: "/aida",         priority: "0.8", changefreq: "monthly" },
  { path: "/compania",     priority: "0.7", changefreq: "monthly" },
  { path: "/blog",         priority: "0.9", changefreq: "daily" },
  { path: "/prensa",       priority: "0.7", changefreq: "monthly" },
  { path: "/contacto",     priority: "0.5", changefreq: "yearly" },
  { path: "/politicas",    priority: "0.5", changefreq: "yearly" },
  { path: "/denuncias",    priority: "0.5", changefreq: "yearly" },
]

function buildUrl({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function generateSitemap() {
  console.log("Conectando a Framer API...")
  const framer = await connect(PROJECT_URL, process.env.FRAMER_API_KEY)

  let blogUrls = []

  try {
    const collections = await framer.getCollections()
    console.log(`Colecciones encontradas: ${collections.length}`)

    for (const collection of collections) {
      const name = collection.name?.toLowerCase() ?? ""
      if (!name.includes("blog") && !name.includes("radar") && !name.includes("noticia")) continue

      console.log(`Leyendo colección: ${collection.name}`)
      const items = await collection.getItems()

      for (const item of items) {
        const slug = item.slug
        if (!slug) continue

        blogUrls.push(buildUrl({
          loc: `${DOMAIN}/blog/${slug}`,
          lastmod: item.fieldData?.fecha ?? TODAY,
          changefreq: "monthly",
          priority: "0.8",
        }))
      }
    }
  } catch (err) {
    console.warn("No se pudieron leer colecciones CMS:", err.message)
  }

  await framer.disconnect()

  const staticUrls = STATIC_PAGES.map(p =>
    buildUrl({ loc: `${DOMAIN}${p.path}`, lastmod: TODAY, changefreq: p.changefreq, priority: p.priority })
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${staticUrls.join("\n")}

${blogUrls.length > 0 ? blogUrls.join("\n") : ""}

</urlset>`

  writeFileSync("sitemap.xml", sitemap.trim())
  console.log(`✅ sitemap.xml generado con ${staticUrls.length + blogUrls.length} URLs (${blogUrls.length} artículos del blog)`)
}

generateSitemap().catch(err => {
  console.error("Error generando sitemap:", err)
  process.exit(1)
})
