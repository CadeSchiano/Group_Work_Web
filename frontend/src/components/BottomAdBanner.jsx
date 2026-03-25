import { useEffect } from "react";

const ADSENSE_CLIENT = import.meta.env.VITE_GOOGLE_ADS_CLIENT;
const ADSENSE_SLOT = import.meta.env.VITE_GOOGLE_ADS_SLOT;

export default function BottomAdBanner() {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        // Keep the page stable if AdSense is blocked or not ready yet.
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT) {
    return (
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist/50">Sponsored Slot</p>
            <p className="truncate text-sm text-mist/80">
              Add `VITE_GOOGLE_ADS_CLIENT` and `VITE_GOOGLE_ADS_SLOT` to enable Google ads here.
            </p>
          </div>
          <a
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-amber-300"
            href="https://adsense.google.com/"
            rel="noreferrer"
            target="_blank"
          >
            Set up AdSense
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-[820px] flex-col gap-1 px-4 py-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-mist/50">Sponsored</p>
        <div className="mx-auto w-full max-w-[728px] overflow-hidden rounded-xl border border-white/10 bg-white px-2 py-1">
          <ins
            className="adsbygoogle block"
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT}
            style={{ display: "inline-block", width: "728px", height: "90px", maxWidth: "100%" }}
          />
        </div>
      </div>
    </aside>
  );
}
