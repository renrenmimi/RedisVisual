import type { Metadata } from "next";
import "./globals.css";
import { LangProvider, langScript } from "@/lib/i18n";
import { ThemeProvider, ShellProvider, themeScript } from "./theme-provider";
import Sidebar from "./sidebar";
import Toolbar from "./toolbar";
import CommandPalette from "./command-palette";

export const metadata: Metadata = {
  // Each stop's folder has a layout.tsx that sets its own title through this template.
  title: {
    default: "RedisVisual — See inside Redis",
    template: "%s · RedisVisual",
  },
  description:
    "A visual Redis course for people starting from zero. Eight stops explain what Redis is, why it is fast, how each data structure works, how caching fails and how to fix it, what changes in production, how to answer the common interview questions, and — in a running simulator — what a cache breakdown or avalanche does to hit rate and latency. Available in English and Chinese.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* No-flash theme, sidebar and language: set data-theme, data-sidebar, data-lang and
            lang on <html> before first paint. English is the default; Chinese only when it
            was chosen before. These sit at the top of <body>, not in <head>: when they were
            hand-written nodes in <head>, hydration failed on a few percent of cold loads
            (React error #418) and the whole root was rendered again on the client, which
            drops the attributes these scripts wrote. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
              <div className="app-shell">
                <Sidebar />
                <div className="main-col">
                  <Toolbar />
                  {/* Each page renders its own <main>; this wrapper only lays out the column. */}
                  <div className="workspace">{children}</div>
                </div>
              </div>
              <CommandPalette />
            </ShellProvider>
          </ThemeProvider>
        </LangProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
