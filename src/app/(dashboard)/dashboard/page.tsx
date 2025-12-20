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

    // Get user's employee record to find their tenant
    const { data: employee } = await supabase
        .from('employees')
        .select(`
            tenant_id,
            tenant:tenants(slug)
        `)
        .eq('user_id', user.id)
        .eq('deleted', false)
        .single()

    if (employee?.tenant_id && employee.tenant) {
        // Redirect to tenant dashboard
        redirect(`/${(employee.tenant as any).slug}/dashboard`)
    }

    // If no employee record, redirect to signup
    redirect('/signup')
}
