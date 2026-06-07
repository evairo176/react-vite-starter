import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface ReactionControlProps {
  /** Current reaction count to display (server/optimistic value). */
  count: number;
  /** Submits a reaction; the parent hook handles optimistic update + rollback. */
  onReact: () => void;
  /** Whether a reaction request is currently in flight. */
  isPending?: boolean;
  /** Whether this browser has already reacted (disables + fills the heart). */
  hasReacted?: boolean;
  className?: string;
}

/**
 * Reaction_Control for the Blog_Detail_View (Req 4.5, 4.6, 21.2).
 *
 * Renders a button with the current reaction count. Activating it triggers the
 * reaction mutation supplied by the parent (which applies the optimistic count
 * and handles rollback + error toast on failure, Req 4.6). On a successful
 * count change a brief confirmation animation plays, unless the visitor has
 * requested reduced motion (Req 21.2). Once the browser has reacted, the
 * control is disabled and the heart is shown filled.
 */
export default function ReactionControl({
  count,
  onReact,
  isPending = false,
  hasReacted = false,
  className,
}: ReactionControlProps) {
  const prefersReducedMotion = useReducedMotion();
  const [celebrate, setCelebrate] = useState(false);
  const prevCount = useRef(count);

  // Play a confirmation pulse whenever the displayed count increases.
  useEffect(() => {
    if (count > prevCount.current && !prefersReducedMotion) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 450);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count, prefersReducedMotion]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onReact}
      disabled={isPending || hasReacted}
      aria-label={
        hasReacted
          ? `You reacted to this post (${count} reactions)`
          : `React to this post (${count} reactions)`
      }
      aria-pressed={hasReacted}
      className={cn("gap-2", hasReacted && "text-rose-500", className)}
    >
      <motion.span
        className="inline-flex"
        animate={celebrate ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Heart
          className={cn("size-4", hasReacted && "fill-rose-500 text-rose-500")}
          aria-hidden="true"
        />
      </motion.span>
      <span>{count}</span>
    </Button>
  );
}
