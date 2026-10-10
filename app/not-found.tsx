import type { Metadata } from "next";
import NotFoundBody from "./not-found-body";

// Any address that is not one of the eight stops. Next still answers with status 404;
// this replaces its default English-only page with a bilingual one and a way back.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundBody />;
}
