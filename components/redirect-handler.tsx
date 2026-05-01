"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const visited = localStorage.getItem("visited");
    if (!visited) {
      router.push("/welcome");
    }
  }, [router]);

  return null;
}
