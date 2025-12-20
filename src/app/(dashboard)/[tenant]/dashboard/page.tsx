import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, ShoppingCart, Package, Users, TrendingUp, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface DashboardPageProps {
    params: Promise<{ tenant: string }>
}

export default async function TenantDashboardPage({ params }: DashboardPageProps) {
    const { tenant: tenantSlug } = await params
    const supabase = await createClient()

    // Get tenant ID
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single()

    if (!tenant) {
        return <div>Tenant not found</div>
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch real data
    const [salesData, itemsData, customersData, lowStockData] = await Promise.all([
        // Today's sales
        supabase
            .from('sales')
            .select('sale_total')
            .eq('tenant_id', tenant.id)
            .gte('sale_time', today.toISOString())
            .lt('sale_time', tomorrow.toISOString()),

        // Total items
        supabase
            .from('items')
            .select('id', { count: 'exact' })
            .eq('tenant_id', tenant.id)
            .eq('deleted', false),

        // Total customers
        supabase
            .from('customers')
            .select('id', { count: 'exact' })
            .eq('tenant_id', tenant.id)
            .eq('deleted', false),

        // Low stock items
        supabase
            .from('items')
            .select(`
                id,
                reorder_level,
                inventory(quantity)
            `)
            .eq('tenant_id', tenant.id)
            .eq('deleted', false)
    ])

    // Calculate stats
    const todaysSales = salesData.data?.reduce((sum, sale) => sum + parseFloat(sale.sale_total || '0'), 0) || 0
    const totalItems = itemsData.count || 0
    const totalCustomers = customersData.count || 0

    // Calculate low stock items
    const lowStockCount = lowStockData.data?.filter(item => {
        const totalStock = (item.inventory as any[])?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
        return totalStock <= (item.reorder_level || 0)
    }).length || 0

    // Get recent sales
    const { data: recentSales } = await supabase
        .from('sales')
        .select(`
            id,
            sale_total,
            sale_time,
            customer:customers(person:people(first_name, last_name))
        `)
        .eq('tenant_id', tenant.id)
        .order('sale_time', { ascending: false })
        .limit(5)

    const stats = [
        {
            title: "Today's Sales",
            value: `Rs. ${todaysSales.toFixed(2)}`,
            description: salesData.data?.length ? `${salesData.data.length} transactions today` : 'No sales yet today',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Items',
            value: totalItems.toString(),
            description: 'Items in inventory',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Customers',
            value: totalCustomers.toString(),
            description: 'Registered customers',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Low Stock Items',
            value: lowStockCount.toString(),
            description: lowStockCount > 0 ? 'Items need reordering' : 'All items in stock',
            icon: BarChart3,
            color: lowStockCount > 0 ? 'text-orange-600' : 'text-green-600',
            bgColor: lowStockCount > 0 ? 'bg-orange-100' : 'bg-green-100',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Real-time overview of your POS system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`rounded-full p-2 ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Sales */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                            {recentSales && recentSales.length > 0
                                ? `Your latest ${recentSales.length} transactions`
                                : 'No sales recorded yet'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSales && recentSales.length > 0 ? (
                            <div className="space-y-3">
                                {recentSales.map((sale: any) => (
                                    <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">
                                                {sale.customer?.person
                                                    ? `${sale.customer.person.first_name} ${sale.customer.person.last_name}`
                                                    : 'Walk-in Customer'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(sale.sale_time).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">Rs. {parseFloat(sale.sale_total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                                Start making sales to see them here
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            href="sales"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">New Sale</div>
                            <div className="text-sm text-muted-foreground">Open POS register</div>
                        </Link>
                        <Link
                            href="items"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">Add Item</div>
                            <div className="text-sm text-muted-foreground">Add new inventory item</div>
                        </Link>
                        <Link
                            href="customers"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">New Customer</div>
                            <div className="text-sm text-muted-foreground">Register new customer</div>
                        </Link>
                        <Link
                            href="reports"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">View Reports</div>
                            <div className="text-sm text-muted-foreground">Sales & inventory reports</div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
