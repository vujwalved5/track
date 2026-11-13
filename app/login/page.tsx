import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClosedBook } from '@/components/book'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    redirect(`/book/${year}/${month}`)
  }

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
