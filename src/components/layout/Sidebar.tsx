'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Truck,
    UserCog,
    BarChart3,
    MapPin,
    Package2,
    Award,
} from 'lucide-react'

interface SidebarProps {
    tenantSlug?: string
}

export function Sidebar({ tenantSlug }: SidebarProps) {
    const pathname = usePathname()
    const baseUrl = tenantSlug ? `/${tenantSlug}` : ''

    const navigation = [
        { name: 'Dashboard', href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
        { name: 'POS Register', href: `${baseUrl}/sales`, icon: ShoppingCart },
        { name: 'Sales History', href: `${baseUrl}/sales-history`, icon: FileText },
        { name: 'Items', href: `${baseUrl}/items`, icon: Package },
        { name: 'Receiving', href: `${baseUrl}/receiving`, icon: Package2 },
        { name: 'Locations', href: `${baseUrl}/locations`, icon: MapPin },
        { name: 'Customers', href: `${baseUrl}/customers`, icon: Users },
        { name: 'Loyalty', href: `${baseUrl}/loyalty`, icon: Award },
        { name: 'Suppliers', href: `${baseUrl}/suppliers`, icon: Truck },
        { name: 'Employees', href: `${baseUrl}/employees`, icon: UserCog },
        { name: 'Reports', href: `${baseUrl}/reports`, icon: BarChart3 },
    ]

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    POS Cloud
                </h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0',
                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
