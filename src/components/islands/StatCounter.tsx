import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function StatCounter({ value, suffix = '', prefix = '', duration = 1.6 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest))
    });
    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
