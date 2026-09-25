"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminLink() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body?.admin === true) setSignedIn(true);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  if (!signedIn) return null;

  return (
    <Link href="/admin" prefetch={false} className="pf-admin pf-admin-enter">
      Admin
      <span aria-hidden="true" className="pf-admin-arrow">
        ↗
      </span>
    </Link>
  );
}
