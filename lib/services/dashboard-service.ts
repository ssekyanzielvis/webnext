import { createClient } from '@/lib/supabase-browser'

export class DashboardService {
  private supabase = createClient()

  async getTotalUsers(): Promise<number> {
    const { count } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    return count || 0
  }

  async getActiveConsignments(): Promise<number> {
    const { count } = await this.supabase
      .from('consignments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'assigned', 'in_transit'])
    
    return count || 0
  }

  async getAvailableDrivers(): Promise<number> {
    const { count } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver')
      .eq('is_active', true)
    
    return count || 0
  }

  async getCompletedToday(): Promise<number> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    const { count } = await this.supabase
      .from('consignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('updated_at', startOfDay)
      .lt('updated_at', endOfDay)
    
    return count || 0
  }
}

export const dashboardService = new DashboardService()
