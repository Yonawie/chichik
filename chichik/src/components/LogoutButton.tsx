"use client";

import { logoutAction } from "@/lib/auth/actions";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        🚪 Выйти
      </button>
    </form>
  );
}
