import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

/** Atajo oculto: Ctrl + Shift + * abre el panel administrativo. */
export function AdminHotkey() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey || !e.shiftKey) return;
      const isStar =
        e.key === "*" || e.code === "Digit8" || e.code === "NumpadMultiply";
      if (!isStar) return;
      e.preventDefault();
      navigate({ to: session ? "/admin" : "/auth" });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, session]);

  return null;
}
