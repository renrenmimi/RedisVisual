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
      <head>
        {/* No-flash theme: set data-theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* No-flash language: set data-lang + lang before first paint.
            English is the default; Chinese only when it was chosen before. */}
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
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
