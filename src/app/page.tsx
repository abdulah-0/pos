import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // If user is logged in, get their tenant and redirect to dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_tenant_id, tenants(slug)')
      .eq('id', user.id)
      .single()

    if (profile?.current_tenant_id && profile.tenants) {
      // User has a tenant, redirect to their dashboard
      redirect(`/${(profile.tenants as any).slug}/dashboard`)
    } else {
      // User doesn't have a tenant - redirect to signup
      redirect('/signup')
    }
  }

  // If not logged in, redirect to marketing landing page
  redirect('/home')
}

