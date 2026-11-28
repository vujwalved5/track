'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBookTransitionStore, type PublicSourcePath } from '@/store/bookTransitionStore'

interface JournalTransitionLinkProps {
  sourcePath: PublicSourcePath
  href?: string
  className?: string
  children: React.ReactNode
}

export function JournalTransitionLink({
  sourcePath,
  href = '/login',
  className,
  children,
}: JournalTransitionLinkProps) {
  const router = useRouter()
  const startPublicTransition = useBookTransitionStore((s) => s.startPublicTransition)

  useEffect(() => {
    router.prefetch(href)
  }, [router, href])

  const handleMouseEnter = () => {
    router.prefetch(href)
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return
    }

    e.preventDefault()

    if (useBookTransitionStore.getState().isActive) {
      return
    }

    router.prefetch(href)

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    startPublicTransition({
      sourcePath,
      prefersReducedMotion,
    })
  }

  return (
    <Link
      href={href}
      prefetch
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
