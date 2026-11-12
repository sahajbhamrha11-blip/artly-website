import { SmartImage } from "./SmartImage";

/** Dark editorial page header used on inner pages. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-coal text-paper">
      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-[44%] lg:block">
          <SmartImage src={image} alt={imageAlt} fill priority sizes="44vw" className="animate-kenburns object-cover object-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-coal via-coal/50 to-transparent" />
        </div>
      )}
      <div className="ember-glow pointer-events-none absolute -bottom-48 -left-24 h-[460px] w-[460px] animate-flicker opacity-60" />
      <div className="container-x relative py-24 lg:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow animate-fade-up text-ember">{eyebrow}</p>
          <h1 className="mt-6 animate-fade-up text-[44px] leading-[1.02] sm:text-6xl lg:text-7xl [animation-delay:120ms]">{title}</h1>
          {intro && <p className="mt-7 max-w-xl animate-fade-up text-[17px] leading-relaxed text-steel [animation-delay:240ms]">{intro}</p>}
          {children && <div className="mt-10 animate-fade-up [animation-delay:360ms]">{children}</div>}
        </div>
      </div>
    </section>
  );
}
