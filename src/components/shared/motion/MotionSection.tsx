import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface MotionSectionProps
  extends Omit<HTMLMotionProps<"section">, "as"> {
  /** Section content to animate in on scroll. */
  children: React.ReactNode;
  /** Delay before the entrance animation starts, in seconds. Defaults to 0. */
  delay?: number;
  /** Animation duration in seconds (150-500ms range). Defaults to 0.4. */
  duration?: number;
  /** Vertical travel distance for the fade-up, in pixels. Defaults to 24. */
  offset?: number;
  /** Fraction of the section that must be visible before animating. Defaults to 0.2. */
  amount?: number;
  /** Whether the animation only plays the first time the section enters view. Defaults to true. */
  once?: boolean;
  /** Additional classes applied to the root element. */
  className?: string;
  /** The motion element/component to render. Defaults to "section". */
  as?: keyof typeof motion;
}

/**
 * Section-level entrance wrapper that fades and slides its content up as the
 * section scrolls into view (`whileInView`). When the visitor requests reduced
 * motion, the content renders immediately without animation. (Req 15.1, 15.4, 15.5)
 */
export default function MotionSection({
  children,
  delay = 0,
  duration = 0.4,
  offset = 24,
  amount = 0.2,
  once = true,
  className,
  as = "section",
  ...rest
}: MotionSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.section;

  if (prefersReducedMotion) {
    return (
      <MotionTag className={cn(className)} {...rest}>
        {children}
      </MotionTag>
    );
  }

  const variants: Variants = {
    hidden: { opacity: 0, y: offset },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration, delay, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
