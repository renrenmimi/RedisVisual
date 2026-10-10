"use client";

// The bilingual body of the 404 page (app/not-found.tsx sets its title).

import Link from "next/link";
import { ui, useLang, t } from "@/lib/i18n";

export default function NotFoundBody() {
  const { lang } = useLang();
  return (
    <main className="page">
      <header className="header">
        <div>
          <h1 className="page-title">{t(ui.notFound.title, lang)}</h1>
          <p className="subtitle">{t(ui.notFound.body, lang)}</p>
        </div>
      </header>
      <Link href="/" className="btn btn-primary">
        {t(ui.notFound.home, lang)}
      </Link>
    </main>
  );
}
