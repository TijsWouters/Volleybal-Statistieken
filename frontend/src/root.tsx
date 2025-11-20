import { Outlet, Scripts } from 'react-router'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="description"
          content="Volleybal Statistieken is een applicatie om statistieken en voorspellingen te bekijken voor teams en competities."
        />
        <meta
          name="keywords"
          content="volleybal, volley, statistieken, voorspellingen, volleybalstatistieken, open source, webapplicatie, clubs, teams, spelers"
        />
        <title>Volleybal Statistieken</title>
      </head>

      <body>
        <div id="root">
          {children}
        </div>
        <Scripts />
      </body>

    </html>
  )
}

export default function Root() {
  return (
    <Outlet />
  )
}
