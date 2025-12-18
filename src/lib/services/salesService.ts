import { createClient } from '@/lib/supabase/client'
import { Cart, Sale, Payment } from '@/types'
import { ensureUniqueInvoiceNumber } from '@/lib/invoiceUtils'

/**
 * Complete a sale transaction
 * This creates the sale record, sale items, payments, and updates inventory
 */
export async function completeSale(
    cart: Cart,
    tenantId: string,
    employeeId: number
): Promise<Sale> {
    const supabase = createClient()

    try {
        // Generate unique invoice number
        const invoiceNumber = await ensureUniqueInvoiceNumber(tenantId)

        // Create sale record
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                tenant_id: tenantId,
                customer_id: cart.customer?.id || null,
                employee_id: employeeId,
                comment: cart.comment || '',
                invoice_number: invoiceNumber,
                sale_type: cart.mode,
                status: 'completed',
                sale_time: new Date().toISOString(),
            })
            .select()
            .single()

        if (saleError) throw saleError

        // Create sale items
        const saleItems = cart.items.map((item, index) => ({
            sale_id: sale.id,
            item_id: item.item_id,
            description: item.description || null,
            serialnumber: item.serialnumber || null,
            line: index + 1,
            quantity_purchased: item.quantity,
            item_cost_price: item.cost_price,
            item_unit_price: item.price,
            discount_percent: item.discount_type === 'percent' ? item.discount : 0,
            item_location: item.item_location,
        }))

        const { error: itemsError } = await supabase
            .from('sales_items')
            .insert(saleItems)

        if (itemsError) throw itemsError

        // Create payment records
        const { error: paymentsError } = await supabase
            .from('sales_payments')
            .insert(
                cart.payments.map((payment) => ({
                    sale_id: sale.id,
                    payment_type: payment.payment_type,
                    payment_amount: payment.payment_amount,
                }))
            )

        if (paymentsError) throw paymentsError

        // Update inventory quantities
        for (const item of cart.items) {
            // Decrement stock
            const { error: qtyError } = await supabase.rpc('update_item_quantity', {
                p_item_id: item.item_id,
                p_location_id: item.item_location,
                p_quantity_change: -item.quantity,
            })

            if (qtyError) {
                console.error('Error updating inventory:', qtyError)
                // Continue even if inventory update fails
            }

            // Create inventory transaction for audit
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                await supabase.from('inventory_transactions').insert({
                    tenant_id: tenantId,
                    item_id: item.item_id,
                    user_id: user.id,
                    comment: `Sale #${invoiceNumber}`,
                    location_id: item.item_location,
                    quantity_change: -item.quantity,
                    trans_date: new Date().toISOString(),
                })
            }
        }

        return sale as Sale
    } catch (error) {
        console.error('Error completing sale:', error)
        throw error
    }
}

/**
 * Suspend a sale for later completion
 */
export async function suspendSale(
    cart: Cart,
    tenantId: string,
    employeeId: number
): Promise<number> {
    const supabase = createClient()

    try {
        // Create sale record with suspended status
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                tenant_id: tenantId,
                customer_id: cart.customer?.id || null,
                employee_id: employeeId,
                comment: cart.comment || 'SUSPENDED',
                sale_type: cart.mode,
                status: 'suspended',
                sale_time: new Date().toISOString(),
            })
            .select()
            .single()

        if (saleError) throw saleError

        // Create sale items
        const saleItems = cart.items.map((item, index) => ({
            sale_id: sale.id,
            item_id: item.item_id,
            description: item.description || null,
            serialnumber: item.serialnumber || null,
            line: index + 1,
            quantity_purchased: item.quantity,
            item_cost_price: item.cost_price,
            item_unit_price: item.price,
            discount_percent: item.discount_type === 'percent' ? item.discount : 0,
            item_location: item.item_location,
        }))

        const { error: itemsError } = await supabase
            .from('sales_items')
            .insert(saleItems)

        if (itemsError) throw itemsError

        return sale.id
    } catch (error) {
        console.error('Error suspending sale:', error)
        throw error
    }
}

/**
 * Load a suspended sale
 */
export async function loadSuspendedSale(saleId: number): Promise<Cart | null> {
    const supabase = createClient()

    try {
        const { data: sale, error } = await supabase
            .from('sales')
            .select(`
                *,
                sales_items (*),
                customer:customers (*)
            `)
            .eq('id', saleId)
            .eq('status', 'suspended')
            .single()

        if (error) throw error
        if (!sale) return null

        // Convert to cart format
        const cart: Cart = {
            items: (sale.sales_items || []).map((item: any) => ({
                item_id: item.item_id,
                name: '', // Will need to fetch item details
                item_number: '',
                description: item.description,
                price: item.item_unit_price,
                cost_price: item.item_cost_price,
                quantity: item.quantity_purchased,
                discount: item.discount_percent,
                discount_type: 'percent' as const,
                serialnumber: item.serialnumber || '',
                is_serialized: false,
                allow_alt_description: false,
                item_location: item.item_location,
            })),
            customer: sale.customer || undefined,
            payments: [],
            comment: sale.comment,
            mode: sale.sale_type,
        }

        return cart
    } catch (error) {
        console.error('Error loading suspended sale:', error)
        return null
    }
}

/**
 * Void a completed sale
 */
export async function voidSale(saleId: number): Promise<void> {
    const supabase = createClient()

    try {
        // Update sale status
        const { error } = await supabase
            .from('sales')
            .update({ status: 'cancelled' })
            .eq('id', saleId)

        if (error) throw error

        // TODO: Restore inventory quantities
    } catch (error) {
        console.error('Error voiding sale:', error)
        throw error
    }
}
