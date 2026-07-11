/**
 * Scrim — Full-viewport dark overlay with SVG mask spotlight cutout
 * Uses animated SVG mask to create a "hole" revealing the spotlight target.
 */

import { motion, AnimatePresence } from "framer-motion";

interface ScrimProps {
  visible: boolean;
  spotlightRect: DOMRect | null;
  padding?: number;
  borderRadius?: number;
}

export default function Scrim({ visible, spotlightRect, padding = 12, borderRadius = 8 }: ScrimProps) {
  const cutout = spotlightRect
    ? {
        x: spotlightRect.x - padding,
        y: spotlightRect.y - padding,
        width: spotlightRect.width + padding * 2,
        height: spotlightRect.height + padding * 2,
      }
    : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9998]"
          style={{ pointerEvents: "all" }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <mask id="onboarding-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {cutout && (
                  <motion.rect
                    animate={{
                      x: cutout.x,
                      y: cutout.y,
                      width: cutout.width,
                      height: cutout.height,
                    }}
                    transition={{ type: "spring", stiffness: 180, damping: 28 }}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.88)"
              mask="url(#onboarding-spotlight-mask)"
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
