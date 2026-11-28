'use client'

import React from 'react'

interface BookCoverArtProps {
  currentYear: number
  currentMonthName: string
  isMobile: boolean
  isOpening: boolean
  enableHover?: boolean
}

export function BookCoverArt({
  currentYear,
  currentMonthName,
  isMobile,
  isOpening,
  enableHover = true,
}: BookCoverArtProps) {
  return (
    <>
      {/* Book block (interior right page visible when opened + page edges on right) */}
      <div
        className="absolute inset-0 rounded-r-2xl overflow-hidden bg-paper pointer-events-none"
        style={{
          boxShadow:
            '14px 18px 45px rgba(0, 0, 0, 0.65), 4px 6px 14px rgba(0, 0, 0, 0.45)',
        }}
        aria-hidden="true"
      >
        {/* Inner spine shadow */}
        <div
          className="w-full h-full"
          style={{
            boxShadow: 'inset 28px 0 32px -12px rgba(28, 36, 51, 0.22)',
          }}
        />

        {/* Page edges visible behind the cover on the right (thin cream stripes) */}
        <div
          className="absolute right-0 top-1.5 bottom-1.5 w-2 sm:w-2.5 rounded-r-sm overflow-hidden pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(to bottom, #f4eddc 0px, #f4eddc 2px, rgba(28, 36, 51, 0.16) 2px, rgba(28, 36, 51, 0.16) 4px)',
            boxShadow:
              'inset 2px 0 3px rgba(28, 36, 51, 0.25), 2px 0 4px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>

      {/* Gold ribbon hanging from the bottom */}
      <div
        className={`absolute left-10 sm:left-14 bg-gold pointer-events-none z-10 ${
          isMobile
            ? 'bottom-[-22px] w-3 h-8'
            : 'bottom-[-34px] w-4 h-12'
        }`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
          boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.55)',
        }}
        aria-hidden="true"
      />

      {/* 3D Hinged Front Cover */}
      <div
        className="absolute inset-y-0 left-0 w-[calc(100%-6px)] rounded-r-2xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          transform: isOpening ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          transition: 'transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)',
          boxShadow: isOpening
            ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
            : '8px 12px 28px rgba(0, 0, 0, 0.55)',
        }}
      >
        {/* Front face of cover */}
        <div
          className={`absolute inset-0 rounded-r-2xl overflow-hidden bg-gradient-to-br from-oxblood to-oxblood-dark flex flex-col justify-between select-none ${
            isMobile ? 'p-3' : 'p-5 sm:p-6'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Darker spine band on the left with gold vertical line */}
          <div
            className={`absolute left-0 top-0 bottom-0 bg-oxblood-dark border-r border-gold/75 pointer-events-none z-10 ${
              isMobile ? 'w-5' : 'w-8 sm:w-10'
            }`}
            aria-hidden="true"
          />

          {/* Gold foil inset double border */}
          <div
            className={`absolute right-2.5 top-2.5 bottom-2.5 border border-gold/70 pointer-events-none rounded-r-lg ${
              isMobile ? 'left-7' : 'left-11 sm:left-13'
            }`}
            aria-hidden="true"
          >
            <div
              className="absolute inset-1 border border-gold/45 rounded-r-md"
              aria-hidden="true"
            />
          </div>

          {/* Title section (Cormorant Garamond, Gold) */}
          <div
            className={`relative z-10 pr-1 text-center ${
              isMobile ? 'pl-5 pt-1.5' : 'pl-9 pt-4'
            }`}
          >
            <p
              className={`font-cover tracking-[0.25em] text-gold uppercase font-medium ${
                isMobile ? 'text-[9px]' : 'text-xs'
              }`}
            >
              VOLUME — {currentYear}
            </p>
            <h1
              className={`font-cover text-gold font-bold tracking-[0.16em] uppercase leading-tight ${
                isMobile ? 'text-base mt-0.5' : 'text-2xl sm:text-3xl mt-2'
              }`}
            >
              MEMORABLE
              <br />
              MOMENTS
            </h1>
            <p
              className={`font-cover italic text-gold/90 tracking-widest font-normal ${
                isMobile ? 'text-[9px] mt-0.5' : 'text-xs sm:text-sm mt-1.5'
              }`}
            >
              a year, kept by hand
            </p>
          </div>

          {/* Handwritten Paper Tag: "Open [Month]" */}
          <div
            className={`relative z-10 pr-1 text-center ${
              isMobile ? 'pl-5 pb-2' : 'pl-9 pb-5'
            }`}
          >
            <div
              className={`inline-flex items-center justify-center bg-paper text-ink border border-kraft/40 rounded-sm shadow-md ${
                enableHover
                  ? 'transition-transform duration-150 group-hover:scale-105 group-hover:-rotate-1'
                  : ''
              } ${
                isMobile
                  ? 'px-3 py-1.5 -rotate-2'
                  : 'px-5 py-2.5 -rotate-2'
              }`}
              style={{
                boxShadow:
                  '0 2px 8px rgba(15, 12, 10, 0.35), inset 0 0 10px rgba(185, 137, 90, 0.2)',
              }}
            >
              <span
                className="font-hand font-bold text-ink tracking-wide whitespace-nowrap"
                style={{
                  fontSize: isMobile ? '13px' : '17px',
                  lineHeight: '22px',
                }}
              >
                {isOpening ? 'turning the page...' : `Open ${currentMonthName}`}
              </span>
            </div>
          </div>
        </div>

        {/* Inside facing endpaper of front cover when swung open */}
        <div
          className="absolute inset-0 rounded-l-2xl bg-paper overflow-hidden pointer-events-none"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
          }}
          aria-hidden="true"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(28, 36, 51, 0.25) 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          />
        </div>
      </div>
    </>
  )
}

interface LoginBookCoverArtProps {
  currentYear: number
  isOpening?: boolean
  isReducedMotion?: boolean
  swayRibbon?: boolean
  cormorantClassName?: string
  waitHint?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
}

export function LoginBookCoverArt({
  currentYear,
  isOpening = false,
  isReducedMotion = false,
  swayRibbon = false,
  cormorantClassName = '',
  waitHint,
  footer,
  children,
}: LoginBookCoverArtProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 ${cormorantClassName} ${
        isOpening && isReducedMotion
          ? 'opacity-0 transition-opacity duration-200'
          : 'opacity-100'
      }`}
    >
      {/* 3D Perspective container */}
      <div
        className="relative w-[min(520px,calc(100vw-32px))] h-[min(700px,calc((100vw-32px)*700/520))] aspect-[520/700] sm:aspect-auto sm:w-[520px] sm:h-[700px]"
        style={{ perspective: '1800px' }}
      >
        {/* Book block (interior right page visible when opened + page edges on right) */}
        <div
          className="absolute inset-0 rounded-r-2xl sm:rounded-r-3xl overflow-hidden bg-paper"
          style={{
            boxShadow:
              '14px 18px 45px rgba(0, 0, 0, 0.65), 4px 6px 14px rgba(0, 0, 0, 0.45)',
          }}
          aria-hidden="true"
        >
          {/* Inner spine shadow */}
          <div
            className="w-full h-full"
            style={{
              boxShadow: 'inset 28px 0 32px -12px rgba(28, 36, 51, 0.22)',
            }}
          />

          {/* Page edges visible behind the cover on the right (thin cream stripes) */}
          <div
            className="absolute right-0 top-1.5 bottom-1.5 w-2.5 sm:w-3 rounded-r-sm overflow-hidden pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to bottom, #f4eddc 0px, #f4eddc 2px, rgba(28, 36, 51, 0.16) 2px, rgba(28, 36, 51, 0.16) 4px)',
              boxShadow:
                'inset 2px 0 3px rgba(28, 36, 51, 0.25), 2px 0 4px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>

        {/* Gold ribbon hanging from the bottom */}
        <div
          className={`absolute bottom-[-38px] sm:bottom-[-48px] left-14 sm:left-20 w-4 sm:w-5 h-12 sm:h-16 bg-gold pointer-events-none z-10 ${
            swayRibbon && !isReducedMotion ? 'animate-ribbon-sway' : ''
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
            boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.55)',
          }}
          aria-hidden="true"
        />

        {/* 3D Hinged Front Cover */}
        <div
          className="absolute inset-y-0 left-0 w-[calc(100%-8px)] sm:w-[calc(100%-10px)] rounded-r-2xl sm:rounded-r-3xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpening ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            transition: 'transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)',
            boxShadow: isOpening
              ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
              : '8px 12px 28px rgba(0, 0, 0, 0.55)',
          }}
        >
          {/* Front face of cover */}
          <div
            className="absolute inset-0 rounded-r-2xl sm:rounded-r-3xl overflow-hidden bg-gradient-to-br from-oxblood to-oxblood-dark flex flex-col justify-between p-4 sm:p-7 select-none"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Darker spine band on the left with gold vertical line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 sm:w-11 bg-oxblood-dark border-r border-gold/75 pointer-events-none z-10"
              aria-hidden="true"
            />

            {/* Gold foil inset double border */}
            <div
              className="absolute left-10 sm:left-14 right-3 sm:right-5 top-3 sm:top-5 bottom-3 sm:bottom-5 border border-gold/70 pointer-events-none rounded-r-lg"
              aria-hidden="true"
            >
              <div
                className="absolute inset-1 sm:inset-1.5 border border-gold/45 rounded-r-md"
                aria-hidden="true"
              />
            </div>

            {/* Title section (Cormorant Garamond, Gold) */}
            <div className="relative z-10 pl-7 sm:pl-9 pr-1 sm:pr-2 pt-2 sm:pt-4 text-center">
              <p className="font-cover text-[10px] sm:text-xs tracking-[0.25em] text-gold uppercase font-medium">
                VOLUME — {currentYear}
              </p>
              <h1 className="font-cover text-2xl sm:text-4xl text-gold font-bold tracking-[0.16em] uppercase leading-tight mt-1 sm:mt-2">
                MEMORABLE
                <br />
                MOMENTS
              </h1>
              <p className="font-cover italic text-xs sm:text-sm text-gold/90 tracking-widest mt-1 sm:mt-2 font-normal">
                a year, kept by hand
              </p>
            </div>

            {/* Cream bookplate label glued on the lower cover */}
            <div className="relative z-10 pl-7 sm:pl-9 pr-1 sm:pr-2 pb-2 sm:pb-3">
              <div
                className="bg-paper text-ink rounded-sm shadow-md border border-kraft/35 p-3.5 sm:p-5 max-w-[340px] sm:max-w-[370px] mx-auto h-[275px] sm:h-[305px] flex flex-col justify-between"
                style={{
                  boxShadow:
                    '0 3px 10px rgba(0, 0, 0, 0.35), inset 0 0 16px rgba(185, 137, 90, 0.15)',
                }}
              >
                {children ?? (
                  <p className="font-cover text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-ink uppercase text-center border-b border-ink/20 pb-1.5 mb-2 sm:mb-2.5">
                    THIS BOOK BELONGS TO
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inside facing endpaper of front cover when swung open */}
          <div
            className="absolute inset-0 rounded-l-2xl sm:rounded-l-3xl bg-paper overflow-hidden pointer-events-none"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
            }}
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(28, 36, 51, 0.25) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Under the book: links or matching vertical spacer */}
      {footer ?? (
        <div className="flex flex-col items-center justify-center gap-2 mt-10 sm:mt-12 text-center select-none min-h-[68px]">
          {waitHint ?? (
            <div className="flex flex-col items-center gap-2 invisible pointer-events-none" aria-hidden="true">
              <span className="font-cover text-xs leading-4">·</span>
              <span className="inline-flex items-center min-h-[44px] font-hand text-xs sm:text-sm">·</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
