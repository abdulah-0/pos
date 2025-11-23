import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user's current tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('current_tenant_id, tenants(slug)')
        .eq('id', user.id)
        .single()

    if (profile?.current_tenant_id && profile.tenants) {
        // Redirect to tenant dashboard
        redirect(`/${(profile.tenants as any).slug}/dashboard`)
    }

    // If no tenant, redirect to onboarding
    redirect('/onboarding')
}
