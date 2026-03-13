import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

function isAuthenticated(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const body = await request.json() as Record<string, string>

  // Login action
  if (body.action === 'login') {
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'ADMIN_PASSWORD no configurado' }, { status: 500 })
    }
    if (body.password === ADMIN_PASSWORD) {
      const res = NextResponse.json({ success: true })
      res.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      return res
    }
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  // All other actions require auth
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
  }

  const client = getSupabaseClient()!

  // Approve
  if (body.action === 'approve' && body.id) {
    const { error } = await client
      .from('community_contributions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewer_note: body.note || null })
      .eq('id', body.id)

    if (error) {
      return NextResponse.json({ error: 'Error al aprobar' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // Reject
  if (body.action === 'reject' && body.id) {
    const { error } = await client
      .from('community_contributions')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewer_note: body.note || null })
      .eq('id', body.id)

    if (error) {
      return NextResponse.json({ error: 'Error al rechazar' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies()

  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ contributions: [], message: 'Supabase no configurado — sin datos' })
  }

  const client = getSupabaseClient()!
  const { data, error } = await client
    .from('community_contributions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener contribuciones' }, { status: 500 })
  }

  return NextResponse.json({ contributions: data })
}
