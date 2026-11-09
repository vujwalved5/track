export default function BookLoading() {
  return (
    <main
      className="h-screen w-screen overflow-hidden desk-surface flex items-center justify-center select-none"
      aria-label="Loading notebook spread"
    >
      {/* Paper spread placeholder with faint handwritten text (L6, L7) */}
      <div
        className="relative bg-paper rounded shadow-[0_20px_50px_rgba(28,36,51,0.7)] border border-desk/50 flex items-center justify-center"
        style={{
          width: 'min(968px, calc(100vw - 32px))',
          height: 'min(660px, calc(100vh - 48px))',
          backgroundImage:
            'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.4px, transparent 1.4px)',
          backgroundSize: '22px 22px',
        }}
      >
        <p className="font-hand text-base text-ink/70 italic tracking-wider">
          turning the page...
        </p>
      </div>
    </main>
  )
}
