'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { motion, useAnimationControls, useIsPresent, type HTMLMotionProps } from 'motion/react';

const motionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverMotionPreference = () => false;
function subscribeMotionPreference(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function useReferenceReducedMotion() {
  return useSyncExternalStore(subscribeMotionPreference, motionPreference, serverMotionPreference);
}

// Parameters measured from Next Whois 1.6 source and browser animations.
const reveals = {
  history: { duration: 0.4, delay: 0.1 },
  result: { duration: 0.5, delay: 0.2 },
  error: { duration: 0.4, delay: 0 },
};

export function ReferenceReveal({
  kind,
  children,
  ...props
}: HTMLMotionProps<'div'> & {
  kind: keyof typeof reveals;
}) {
  const reduced = useReferenceReducedMotion();
  const controls = useAnimationControls();
  useEffect(() => {
    if (reduced) controls.set({ opacity: 1, y: 0 });
    else
      void controls.start({ opacity: 1, y: 0, transition: { ...reveals[kind], ease: 'easeOut' } });
  }, [controls, kind, reduced]);
  return (
    <motion.div
      {...props}
      data-motion-reveal={kind}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

export function ReferenceMenu({
  side = 'bottom',
  children,
  ...props
}: HTMLMotionProps<'div'> & {
  side?: 'top' | 'bottom';
}) {
  const reduced = useReferenceReducedMotion();
  const present = useIsPresent();
  return (
    <motion.div
      {...props}
      data-state={present ? 'open' : 'closed'}
      aria-hidden={!present || undefined}
      inert={!present}
      initial={reduced ? false : { opacity: 0, scale: 0.95, y: side === 'top' ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.95, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.15, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ReferenceThemeIcon({ children, ...props }: HTMLMotionProps<'span'>) {
  const reduced = useReferenceReducedMotion();
  const controls = useAnimationControls();
  useEffect(() => {
    if (reduced) controls.set({ opacity: 1, rotate: 0 });
    else
      void controls.start({
        opacity: 1,
        rotate: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
      });
  }, [controls, reduced]);
  return (
    <motion.span
      {...props}
      className="theme-icon"
      initial={reduced ? false : { opacity: 0, rotate: -180 }}
      animate={controls}
      exit={{ opacity: 0, rotate: reduced ? 0 : 180 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}
