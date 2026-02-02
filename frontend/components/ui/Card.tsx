'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'glass'
  hover?: boolean
  children: React.ReactNode
}

export default function Card({
  variant = 'default',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={clsx(
        'rounded-card',
        {
          'bg-california-white border border-california-border shadow-card': variant === 'default',
          'bg-california-white shadow-panel': variant === 'elevated',
          'glass': variant === 'glass',
        },
        hover && 'transition-smooth hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
