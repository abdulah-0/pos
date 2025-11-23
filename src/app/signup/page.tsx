'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check } from 'lucide-react'

export default function SignupPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        businessName: '',
        phone: '',
        plan: 'professional',
    })

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Step 1: Create Supabase auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                // Step 2: Create tenant
                const slug = formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                const { data: tenant, error: tenantError } = await supabase
                    .from('tenants')
                    .insert({
                        name: formData.businessName,
                        slug: slug,
                        subscription_plan: formData.plan,
                        subscription_status: 'trial',
                        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
                    })
                    .select()
                    .single()

                if (tenantError) throw tenantError

                // Step 3: Create profile
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: authData.user.id,
                    full_name: formData.fullName,
                    current_tenant_id: tenant.id,
                })

                if (profileError) throw profileError

                // Step 4: Create tenant_user relationship
                const { error: tenantUserError } = await supabase.from('tenant_users').insert({
                    tenant_id: tenant.id,
                    user_id: authData.user.id,
                    role: 'owner',
                    joined_at: new Date().toISOString(),
                })

                if (tenantUserError) throw tenantUserError

                // Step 5: Create default stock location
                await supabase.from('stock_locations').insert({
                    tenant_id: tenant.id,
                    location_name: 'Main Store',
                })

                // Success! Redirect to dashboard
                setStep(4)
                setTimeout(() => {
                    router.push(`/${slug}/dashboard`)
                }, 2000)
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup')
            setLoading(false)
        }
    }

    const plans = {
        starter: { name: 'Starter', price: 29 },
        professional: { name: 'Professional', price: 79 },
        enterprise: { name: 'Enterprise', price: 199 },
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>
                        Start your 14-day free trial. No credit card required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Progress Steps */}
                    <div className="mb-8 flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= s
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {step > s ? <Check className="h-5 w-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`mx-2 h-1 w-16 ${step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                setStep(2)
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                            </div>
                            <Button type="submit" className="w-full">
                                Continue
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                setStep(3)
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                                    Back
                                </Button>
                                <Button type="submit" className="w-full">
                                    Continue
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plan">Select Plan</Label>
                                <Select
                                    value={formData.plan}
                                    onValueChange={(value) => setFormData({ ...formData, plan: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(plans).map(([key, plan]) => (
                                            <SelectItem key={key} value={key}>
                                                {plan.name} - ${plan.price}/month
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-4">
                                <h3 className="font-semibold">Your Free Trial</h3>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                    <li>• 14 days free trial</li>
                                    <li>• No credit card required</li>
                                    <li>• Cancel anytime</li>
                                    <li>• Full access to all features</li>
                                </ul>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
                            )}

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">
                                    Back
                                </Button>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Start Free Trial'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Account created successfully!</h3>
                            <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
                        </div>
                    )}

                    {step < 4 && (
                        <div className="mt-6 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
