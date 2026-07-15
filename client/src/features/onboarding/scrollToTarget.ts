// ─── Scroll-to-target helper ────────────────────────────────────────
// Smooth-scrolls an element into view with a fixed top offset, then invokes
// a callback once the scroll settles. Shared by OnboardingController's
// spotlight sequencing and the hook modal's "go to Featured Incident" CTA.

const SCROLL_OFFSET = 120;

export function scrollToTarget(el: HTMLElement, callback?: () => void): () => void {
  const rect = el.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top - SCROLL_OFFSET;

  window.scrollTo({ top: Math.max(0, absoluteTop), behavior: "smooth" });

  const settle = setTimeout(() => {
    callback?.();
  }, 500);

  return () => clearTimeout(settle);
}
