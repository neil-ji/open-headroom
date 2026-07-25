import { useRef } from "react";
import { useCountUp } from "react-countup";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  /** Override default duration (1.5s). Set to 0 to disable animation. */
  duration?: number;
}

export function AnimatedNumber({ value, className, style, duration }: AnimatedNumberProps) {
  const countUpRef = useRef<HTMLElement>(null!);
  const prefersReduced = useReducedMotion();
  const shouldAnimate = !prefersReduced && (duration ?? 1.5) > 0;

  useCountUp({
    ref: countUpRef,
    end: value,
    duration: shouldAnimate ? (duration ?? 1.5) : 0,
    enableReinitialize: true,
    separator: ",",
    decimal: ".",
    decimals: 0,
  });

  return (
    <span
      ref={countUpRef}
      className={className}
      style={style}
    />
  );
}

/** Convenience hook for use in components that need the ref directly. */
export function useAnimatedValue(value: number, options?: { duration?: number }) {
  const countUpRef = useRef<HTMLElement>(null!);
  const prefersReduced = useReducedMotion();
  const shouldAnimate = !prefersReduced && (options?.duration ?? 1.5) > 0;

  const api = useCountUp({
    ref: countUpRef,
    end: value,
    duration: shouldAnimate ? (options?.duration ?? 1.5) : 0,
    enableReinitialize: true,
    separator: ",",
    decimal: ".",
    decimals: 0,
  });

  return { countUpRef, ...api };
}
