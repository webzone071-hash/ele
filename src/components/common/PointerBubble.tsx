import React, { useEffect, useState, useCallback } from "react";

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  wobble: number;
  duration: number;
}

export const PointerBubble: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // Spawn a cluster of floating bubbles upon clicking anywhere on the page
  const handleClick = useCallback((e: MouseEvent) => {
    // Generate 12 to 16 floating bubbles at click coordinates
    const count = Math.floor(Math.random() * 5) + 12;
    const now = Date.now();
    const newBubbles: Bubble[] = [];

    for (let i = 0; i < count; i++) {
      // Natural angle with upward bias (spreading upwards and outwards)
      const angle = (Math.PI / 6) + (Math.random() * (Math.PI * 2 / 3)); // -30° to -150° upward
      const distance = Math.random() * 70 + 45; // 45px to 115px rise
      const dx = (Math.random() - 0.5) * 80; // horizontal drift (-40px to +40px)
      const dy = -Math.sin(angle) * distance - (Math.random() * 40 + 30); // upward (-75px to -155px)
      const size = Math.floor(Math.random() * 16) + 8; // 8px to 24px

      newBubbles.push({
        id: `bubble-${now}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        x: e.clientX,
        y: e.clientY,
        size,
        dx,
        dy,
        wobble: (Math.random() - 0.5) * 20,
        duration: 1000, // exactly 1 second
      });
    }

    setBubbles((prev) => [...prev, ...newBubbles]);

    // Clean up expired bubbles after 1050ms
    setTimeout(() => {
      const expirationThreshold = Date.now() - 1000;
      setBubbles((prev) =>
        prev.filter((b) => {
          const parts = b.id.split("-");
          const created = Number(parts[1]) || 0;
          return created > expirationThreshold;
        })
      );
    }, 1050);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick, { passive: true });
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  if (bubbles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden"
    >
      <style>{`
        @keyframes floatBubbleUp {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(0.25);
          }
          15% {
            opacity: 0.95;
            transform: translate(-50%, -50%) translate3d(calc(var(--dx) * 0.15), calc(var(--dy) * 0.15), 0) scale(1);
          }
          65% {
            opacity: 0.8;
            transform: translate(-50%, -50%) translate3d(calc(var(--dx) * 0.65 + var(--wobble)), calc(var(--dy) * 0.65), 0) scale(1.05);
          }
          90% {
            opacity: 0.4;
            transform: translate(-50%, -50%) translate3d(calc(var(--dx) * 0.9), calc(var(--dy) * 0.9), 0) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(var(--dx), var(--dy), 0) scale(1.25);
          }
        }
      `}</style>

      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={
            {
              left: `${b.x}px`,
              top: `${b.y}px`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              "--dx": `${b.dx}px`,
              "--dy": `${b.dy}px`,
              "--wobble": `${b.wobble}px`,
              animation: "floatBubbleUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(220, 230, 245, 0.35) 40%, rgba(180, 200, 230, 0.15) 70%, rgba(120, 140, 180, 0.25) 100%)",
              boxShadow:
                "inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(90, 110, 140, 0.25), 0 2px 6px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(160, 180, 210, 0.45)",
            } as React.CSSProperties
          }
        >
          {/* Subtle glossy micro highlight inside bubble */}
          <span
            className="absolute rounded-full bg-white/90 pointer-events-none"
            style={{
              top: "18%",
              left: "22%",
              width: `${Math.max(2, b.size * 0.22)}px`,
              height: `${Math.max(2, b.size * 0.22)}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
};
