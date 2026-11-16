import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getWidgetMetadata } from '@/components/widgets/widgetMetadata'

const widgetConfigPayloadSchema = z.object({
  widgetId: z.string().uuid(),
  config: z.record(z.unknown()),
})

/**
 * Route handler for persisting widget configs with fetch keepalive during page unloads.
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
    const parsed = widgetConfigPayloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        },
        { status: 400 },
      )
    }

    const { widgetId, config } = parsed.data

    // 3. Fetch target widget to validate type and config schema
    const { data: targetWidget, error: fetchErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single()

    if (fetchErr || !targetWidget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
    }

    let validatedConfig = config
    const meta = getWidgetMetadata(targetWidget.type)
    if (meta) {
      const configParsed = meta.schema.safeParse(config)
      if (configParsed.success) {
        validatedConfig = configParsed.data as Record<string, unknown>
      }
    }

    const { data, error } = await supabase
      .from('widgets')
      .update({ config: validatedConfig })
      .eq('id', widgetId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Config update failed' },
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
