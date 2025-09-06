'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Animation variants for different transition types
const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const slideVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.05,
  },
};

const authVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

// Transition configurations
const transitions = {
  default: {
    duration: 0.25,
    ease: [0.25, 0.46, 0.45, 0.94] as const, // Custom easing for smooth feel
  },
  fast: {
    duration: 0.15,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  },
  slow: {
    duration: 0.35,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
};

// Page transition wrapper component
interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'auth';
  transition?: 'default' | 'fast' | 'slow' | 'spring';
  className?: string;
}

export function PageTransition({
  children,
  variant = 'fade',
  transition = 'default',
  className = ''
}: PageTransitionProps) {
  const pathname = usePathname();

  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      case 'auth':
        return authVariants;
      default:
        return fadeVariants;
    }
  };

  const getTransition = () => {
    return transitions[transition];
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={getTransition()}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Authentication form transition wrapper
interface AuthFormTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export function AuthFormTransition({
  children,
  isVisible,
  className = ''
}: AuthFormTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={authVariants}
          transition={transitions.default}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Form field animation wrapper
interface FormFieldTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FormFieldTransition({
  children,
  delay = 0,
  className = ''
}: FormFieldTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...transitions.default,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Loading animation component
interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function LoadingTransition({
  isLoading,
  children,
  loadingComponent,
  className = ''
}: LoadingTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitions.fast}
          className={className}
        >
          {loadingComponent || (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitions.fast}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Button press animation
interface ButtonTransitionProps {
  children: React.ReactNode;
  isPressed?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ButtonTransition({
  children,
  isPressed = false,
  disabled = false,
  className = '',
  onClick
}: ButtonTransitionProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
      transition={transitions.fast}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Stagger animation for lists
interface StaggerTransitionProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggerTransition({
  children,
  staggerDelay = 0.1,
  className = ''
}: StaggerTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
          }}
          transition={transitions.default}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Error message animation
interface ErrorTransitionProps {
  error: string | null;
  className?: string;
}

export function ErrorTransition({ error, className = '' }: ErrorTransitionProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={transitions.default}
          className={className}
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
