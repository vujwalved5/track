import Paper, { PAGE_W, PAGE_H } from '@/components/paper'

export default function HomeLoading() {
  return (
    <main
      className="h-screen w-screen overflow-hidden desk-surface flex items-center justify-center select-none"
      aria-label="Opening Journal"
    >
      <style>{`
        @keyframes faintTextFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Mobile single open dotted page (< 768px) */}
      <div className="flex md:hidden relative bg-ink rounded-lg p-[8px] shadow-2xl border border-desk max-w-[calc(100vw-24px)] overflow-hidden">
        <div className="w-[min(484px,calc(100vw-40px))] h-[min(660px,calc((100vw-40px)*660/484))] relative">
          <Paper type="dotted" side="right" className="!w-full !h-full">
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <p
                className="font-hand text-ink/35 text-base sm:text-lg italic tracking-wider select-none"
                style={{
                  animation: 'faintTextFadeIn 600ms ease-in 400ms forwards',
                  opacity: 0,
                }}
              >
                turning the page...
              </p>
            </div>
          </Paper>
        </div>
      </div>

      {/* Desktop two-page open dotted spread (>= 768px) */}
      <div
        className="hidden md:flex relative bg-ink rounded-lg p-[12px] shadow-[0_20px_50px_rgba(28,36,51,0.7),0_2px_8px_rgba(33,27,22,0.5)] border border-desk"
        style={{
          width: PAGE_W * 2 + 24,
          height: PAGE_H + 24,
        }}
      >
        {/* Spine crease shadow */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0.35) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Flat open spread with dotted paper */}
        <div className="flex relative">
          <Paper type="dotted" side="left" />
          <Paper type="dotted" side="right">
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <p
                className="font-hand text-ink/35 text-lg italic tracking-wider select-none"
                style={{
                  animation: 'faintTextFadeIn 600ms ease-in 400ms forwards',
                  opacity: 0,
                }}
              >
                turning the page...
              </p>
            </div>
          </Paper>
        </div>
      </div>
    </main>
  )
}
