<?xml version="1.0" encoding="UTF-8"?>
<!-- Human-readable view of sitemap.xml in browsers. Search engines read the XML and ignore this. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>XML Sitemap · Aashish Khadka</title>
        <style>
          :root { --bg: #f6f5f1; --paper: #fff; --ink: #151514; --muted: #5d5b55; --line: #dedbd2; --accent: #c2410c; }
          @media (prefers-color-scheme: dark) { :root { --bg: #121211; --paper: #1a1a19; --ink: #f1efea; --muted: #a9a69e; --line: #2d2c29; --accent: #ff7a3d; } }
          * { box-sizing: border-box; }
          body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
          main { max-width: 64rem; margin: 0 auto; padding: 3rem 1rem 4rem; }
          h1 { margin: 0; font-size: 1.75rem; letter-spacing: -0.02em; }
          p { margin: 0.5rem 0 0; color: var(--muted); }
          a { color: inherit; }
          .table { margin-top: 2rem; overflow-x: auto; border: 1px solid var(--line); border-radius: 1rem; background: var(--paper); }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
          th { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
          tr:last-child td { border-bottom: 0; }
          td.url a { text-decoration: none; word-break: break-all; }
          td.url a:hover { color: var(--accent); text-decoration: underline; }
          td.date { white-space: nowrap; color: var(--muted); font-variant-numeric: tabular-nums; }
          .n { color: var(--muted); width: 3rem; }
        </style>
      </head>
      <body>
        <main>
          <h1>XML Sitemap</h1>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p>This sitemap index lists <strong><xsl:value-of select="count(s:sitemapindex/s:sitemap)" /></strong> sitemap(s).</p>
              <div class="table"><table>
                <tr><th class="n">#</th><th>Sitemap</th></tr>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td class="n"><xsl:value-of select="position()" /></td>
                    <td class="url"><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                  </tr>
                </xsl:for-each>
              </table></div>
            </xsl:when>
            <xsl:otherwise>
              <p><strong><xsl:value-of select="count(s:urlset/s:url)" /></strong> pages on aashishkhadka.com.np, updated automatically with every new post. Search engines read this file. For a browsable list, see the <a href="/sitemap/">sitemap page</a>.</p>
              <div class="table"><table>
                <tr><th class="n">#</th><th>URL</th><th>Last updated</th></tr>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="n"><xsl:value-of select="position()" /></td>
                    <td class="url"><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                    <td class="date">
                      <xsl:choose>
                        <xsl:when test="s:lastmod"><xsl:value-of select="concat(substring(s:lastmod, 1, 10), ' ', substring(s:lastmod, 12, 5))" /></xsl:when>
                        <xsl:otherwise>—</xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </table></div>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
