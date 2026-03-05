import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ParallaxProps {
  children?: ReactNode;
  offset?: number;
  className?: string;
  class?: string;
  style?: React.CSSProperties;
}

export function Parallax({ children, offset = 50, className = '', class: classProp = '', style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const combinedClassName = `${className} ${classProp}`.trim();

  return (
    <motion.div ref={ref} className={combinedClassName} style={{ y, ...style }}>
      {children}
    </motion.div>
  );
}

interface ParallaxTextProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  class?: string;
  style?: React.CSSProperties;
}

export function ParallaxText({ children, speed = 0.5, className = '', class: classProp = '', style }: ParallaxTextProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const combinedClassName = `${className} ${classProp}`.trim();

  return (
    <motion.div style={{ y }} className={combinedClassName}>
      {children}
    </motion.div>
  );
}

interface ParallaxScaleProps {
  children: ReactNode;
  scale?: [number, number];
  className?: string;
  class?: string;
  style?: React.CSSProperties;
}

export function ParallaxScale({ children, scale = [0.8, 1], className = '', class: classProp = '', style }: ParallaxScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scaleValue = useTransform(scrollYProgress, [0, 1], scale);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const combinedClassName = `${className} ${classProp}`.trim();

  return (
    <motion.div ref={ref} className={combinedClassName} style={{ scale: scaleValue, opacity, ...style }}>
      {children}
    </motion.div>
  );
}
