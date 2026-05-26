"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/spotmyglam-logo.svg"
            alt="SpotMyGlam"
            width={36}
            height={36}
            priority
          />
          <span className="font-display text-xl tracking-tight text-black">
            SpotMyGlam
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-black/80 md:flex">
          <Link href="/salons">Discover</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/owner">Owner</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <div className="hidden text-sm text-black/70 md:block">
                {user.fullName ?? user.phoneNumber}
              </div>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
