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
    return null;
  }

  return (
    <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mx-auto flex max-w-[820px] flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-mist/50">Sponsored</p>
          <p className="mt-2 max-w-2xl text-sm text-mist/70">
            Ads are shown only on public content pages so they stay separate from account, navigation, and workspace screens.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[728px] overflow-hidden rounded-xl border border-white/10 bg-white px-2 py-3">
          <ins
            className="adsbygoogle block"
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
            style={{ display: "block", minHeight: "90px" }}
          />
        </div>
      </div>
    </aside>
  );
}
