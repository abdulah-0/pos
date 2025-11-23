'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Store, Package, Users, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        locationName: 'Main Store',
                < CardHeader >
                    <CardTitle className="text-3xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome to POS Cloud! 🎉
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        Let's get your store set up in just a few steps
                    </CardDescription>
                </CardHeader >
        <CardContent>
            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${step >= s
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {step > s ? <Check className="h-5 w-5" /> : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`mx-2 h-1 w-16 transition-all ${step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Welcome */}
            {step === 1 && (
                <div className="space-y-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Store className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
                        <p className="text-gray-600">
                            Your account has been created successfully. Let's set up your first store location.
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 space-y-3 text-left">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            What you'll set up:
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
                                <span>Your first store location</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
                                <span>Add your first product (optional)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600" />
                                <span>Start selling immediately!</span>
                            </li>
                        </ul>
                    </div>
                    <Button
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                        size="lg"
                    >
                        Let's Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Step 2: Store Location */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Set up your store location</h3>
                        <p className="text-gray-600 text-sm">
                            This is where you'll manage your inventory and process sales
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="locationName">Store Location Name</Label>
                            <Input
                                id="locationName"
                                placeholder="e.g., Main Store, Downtown Branch"
                                value={formData.locationName}
                                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">
                                You can add more locations later from settings
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="w-full"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setStep(3)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                            disabled={!formData.locationName}
                        >
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: First Product */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Add your first product</h3>
                        <p className="text-gray-600 text-sm">
                            Optional - You can skip this and add products later
                        </p>
                    </div>

                    {!formData.skipItems ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstItemName">Product Name</Label>
                                <Input
                                    id="firstItemName"
                                    placeholder="e.g., Coffee, T-Shirt, Widget"
                                    value={formData.firstItemName}
                                    onChange={(e) => setFormData({ ...formData, firstItemName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstItemPrice">Price</Label>
                                <Input
                                    id="firstItemPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="9.99"
                                    value={formData.firstItemPrice}
                                    onChange={(e) => setFormData({ ...formData, firstItemPrice: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">
                                    We'll add 10 units to your inventory
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setFormData({ ...formData, skipItems: true })}
                                className="w-full"
                            >
                                Skip - I'll add products later
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-4">
                                No problem! You can add products anytime from your dashboard.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setFormData({ ...formData, skipItems: false })}
                            >
                                Actually, let me add one now
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setStep(2)}
                            className="w-full"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleComplete}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                            disabled={loading || (!formData.skipItems && (!formData.firstItemName || !formData.firstItemPrice))}
                        >
                            {loading ? 'Setting up...' : 'Complete Setup'}
                            <Check className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-center text-xs text-gray-500">
                Need help? Check out our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                    getting started guide
                </a>
            </div>
        </CardContent>
            </Card >
        </div >
    )
}
