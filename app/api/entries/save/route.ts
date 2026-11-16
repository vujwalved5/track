import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { entryPayloadSchema } from '@/components/widgets/entrySchemas'

/**
 * Route handler for persisting entries with fetch keepalive during page unloads.
 *
 * Rules (Amendment 4):
 * - Uses signed-in user's session client (never service role key).
 * - Rejects unauthenticated requests with 401.
 * - Validates body with Zod (entryPayloadSchema).
 * - Upserts only the value column on (widget_id, day).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Session authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: active session required' },
        { status: 401 },
      )
    }

    // 2. Parse and validate JSON payload
    const json = await req.json()
    const parsed = entryPayloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        },
        { status: 400 },
      )
    }

    const { widgetId, day, value } = parsed.data

    // 3. Upsert into entries on (widget_id, day), updating only the value column
    const { data, error } = await supabase
      .from('entries')
      .upsert(
        {
          widget_id: widgetId,
          day,
          value,
        },
        { onConflict: 'widget_id,day' },
      )
      .select('id, widget_id, day, value, created_at')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Database upsert failed' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
