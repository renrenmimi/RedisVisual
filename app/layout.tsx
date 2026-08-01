import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider, ShellProvider, themeScript } from "./theme-provider";
import Sidebar from "./sidebar";
import Toolbar from "./toolbar";
import CommandPalette from "./command-palette";

export const metadata: Metadata = {
  title: "RedisLab — 看得见的 Redis · See Inside Redis",
  description:
    "把 Redis 讲成看得见的慢动作：是什么、为什么快、我们的系统为什么用它 · A visual, slow-motion explainer for Redis — what it is, why it's fast, and why a real system reaches for it",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* No-flash theme: set data-theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
              <div className="app-shell">
                <Sidebar />
                <div className="main-col">
                  <Toolbar />
                  <main className="workspace">{children}</main>
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
