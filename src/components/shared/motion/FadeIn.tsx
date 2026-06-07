import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Direction the children slide in from while fading in. */
export type FadeInDirection = "up" | "down" | "left" | "right" | "none";

const OFFSET = 16;

function getOffset(direction: FadeInDirection): { x: number; y: number } {
  switch (direction) {
    case "up":
      return { x: 0, y: OFFSET };
    case "down":
      return { x: 0, y: -OFFSET };
    case "left":
      return { x: OFFSET, y: 0 };
    case "right":
      return { x: -OFFSET, y: 0 };
    case "none":
    default:
      return { x: 0, y: 0 };
  }
}

export interface FadeInProps extends Omit<HTMLMotionProps<"div">, "as"> {
  /** Content to animate in. */
  children: React.ReactNode;
  /** Delay before the entrance animation starts, in seconds. Defaults to 0. */
  delay?: number;
  /** Animation duration in seconds (150-500ms range). Defaults to 0.35. */
  duration?: number;
  /** Direction the children slide in from. Defaults to "up". */
  direction?: FadeInDirection;
  /** Additional classes applied to the root element. */
  className?: string;
  /** The motion element/component to render. Defaults to "div". */
  as?: keyof typeof motion;
}

/**
 * framer-motion wrapper that applies an entrance fade/slide animation to its
 * children. When the visitor requests reduced motion, the children render
 * immediately without any animation. (Req 15.1, 15.4, 15.5)
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.35,
  direction = "up",
  className,
  as = "div",
  ...rest
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (prefersReducedMotion) {
    return (
      <MotionTag className={cn(className)} {...rest}>
        {children}
      </MotionTag>
    );
  }

  const offset = getOffset(direction);
  const variants: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
