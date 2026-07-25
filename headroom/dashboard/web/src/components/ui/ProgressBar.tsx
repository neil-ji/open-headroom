import { Progress } from "@spark-ui/components";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  fillColor?: string;
}

/** Wrapper around spark-ui Progress for backward compatibility.
 *  Note: spark-ui Progress doesn't support custom fillColor via prop;
 *  the color is determined by the `status` variant or CSS variable override. */
export function ProgressBar({
  value,
  max = 100,
  className,
}: ProgressBarProps) {
  return (
    <Progress
      value={value}
      max={max}
      variant="linear"
      className={className}
      spark={false}
    />
  );
}
