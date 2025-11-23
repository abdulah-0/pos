import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, ShoppingCart, Package, Users } from 'lucide-react'

export default function TenantDashboardPage() {
    const stats = [
        {
            title: "Today's Sales",
            value: '$0.00',
            description: 'No sales yet today',
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Items',
            value: '0',
            description: 'Items in inventory',
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Customers',
            value: '0',
            description: 'Registered customers',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Low Stock Items',
            value: '0',
            description: 'Items need reordering',
            icon: BarChart3,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your POS system</p>
            </div>

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
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>No sales recorded yet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                            Start making sales to see them here
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a
                            href="sales"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">New Sale</div>
                            <div className="text-sm text-muted-foreground">Open POS register</div>
                        </a>
                        <a
                            href="items"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">Add Item</div>
                            <div className="text-sm text-muted-foreground">Add new inventory item</div>
                        </a>
                        <a
                            href="customers"
                            className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">New Customer</div>
                            <div className="text-sm text-muted-foreground">Register new customer</div>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
