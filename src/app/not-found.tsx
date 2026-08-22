import Link from "next/link";

export default function NotFound() {
  return (
    <div className="starfield flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">404</p>
      <h1 className="display mt-3 text-4xl">This region of the universe is empty.</h1>
      <Link href="/" className="btn btn-primary mt-8">
        Return home
      </Link>
    </div>
  );
}
