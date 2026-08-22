"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup } from "@/actions/auth";
import { Logo } from "@/components/brand/Logo";
import type { FormState } from "@/lib/types";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "signup" ? signup : login;
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    action,
    undefined,
  );

  return (
    <div className="starfield flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex">
          <Logo />
        </Link>
        <div className="panel rounded-3xl p-8">
          <p className="text-[11px] tracking-[0.24em] text-gold uppercase">
            {mode === "signup" ? "Create your universe" : "Welcome back"}
          </p>
          <h1 className="display mt-3 text-3xl font-semibold">
            {mode === "signup" ? "Sign up" : "Log in"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "signup"
              ? "Your first universe is created the moment you arrive."
              : "Return to the map of everything you are building."}
          </p>

          <form action={formAction} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="field-label">Name</span>
                <input className="field" name="name" placeholder="Eric" required />
                {state?.fieldErrors?.name ? (
                  <p className="mt-1 text-sm text-danger">{state.fieldErrors.name}</p>
                ) : null}
              </label>
            ) : null}
            <label className="block">
              <span className="field-label">Email</span>
              <input
                className="field"
                name="email"
                type="email"
                placeholder="eric@universe.co"
                required
              />
              {state?.fieldErrors?.email ? (
                <p className="mt-1 text-sm text-danger">{state.fieldErrors.email}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <input
                className="field"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
              />
              {state?.fieldErrors?.password ? (
                <p className="mt-1 text-sm text-danger">{state.fieldErrors.password}</p>
              ) : null}
            </label>
            {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
            <button className="btn btn-primary w-full" disabled={pending} type="submit">
              {pending
                ? "Opening the universe…"
                : mode === "signup"
                  ? "Create Your Universe"
                  : "Enter Your Universe"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "signup" ? "Already have a universe?" : "New here?"}{" "}
            <Link
              className="text-cream underline-offset-4 hover:underline"
              href={mode === "signup" ? "/login" : "/signup"}
            >
              {mode === "signup" ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
