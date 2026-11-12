import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next = "" } = await searchParams;
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grain relative hidden overflow-hidden bg-coal lg:block">
        <div className="ember-glow absolute -bottom-40 left-1/4 h-[600px] w-[600px] animate-flicker" />
        <div className="absolute bottom-12 left-12 text-paper">
          <p className="font-display text-6xl leading-none">Deliver</p>
          <p className="font-display text-6xl leading-none text-ember italic">Comfort.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo height={46} href="/" />
          <h1 className="mt-12 text-4xl">Admin sign in</h1>
          <p className="mt-2 text-[14px] text-metal">Manage products, enquiries and website content.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
