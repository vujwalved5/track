import { ClosedBook } from '@/components/book'

export default function EnterPage() {
  return (
    <main
      className="min-h-screen bg-desk flex flex-col items-center justify-center relative overflow-x-hidden py-8 px-4"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(33, 27, 22, 0.4) 0%, rgba(15, 12, 10, 0.85) 100%), #211b16',
      }}
    >
      <ClosedBook />
    </main>
  )
}
