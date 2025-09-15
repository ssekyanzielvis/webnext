'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiTruck, FiCheckCircle, FiUserPlus, FiSettings } from 'react-icons/fi'
import { MdLocalShipping, MdAdminPanelSettings, MdSupervisorAccount, MdLocalGasStation } from 'react-icons/md'
import { createClient } from '@/lib/supabase-browser'
import { dashboardService } from '@/lib/services/dashboard-service'

export default function AdminDashboard() {
  const supabase = createClient()
  const [role, setRole] = useState<string>('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConsignments: 0,
    availableDrivers: 0,
    completedToday: 0,
  })
  const [userName, setUserName] = useState('Administrator')

  useEffect(() => {
    const run = async () => {
      // Check authentication and role
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const r = (user.user_metadata as any)?.role || (user.app_metadata as any)?.role
      setRole(r)
      if (r !== 'admin' && r !== 'other_admin') { window.location.href = '/'; return }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      if (profile?.full_name) {
        setUserName(profile.full_name)
      }

      // Fetch dashboard stats
      const [totalUsers, activeConsignments, availableDrivers, completedToday] = await Promise.all([
        dashboardService.getTotalUsers(),
        dashboardService.getActiveConsignments(),
        dashboardService.getAvailableDrivers(),
        dashboardService.getCompletedToday(),
      ])

      setStats({
        totalUsers,
        activeConsignments,
        availableDrivers,
        completedToday,
      })
    }
    void run()
  }, [supabase])

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary to-blue-500 text-white p-6 rounded-lg mb-8">
        <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
        <p className="text-blue-100">Manage your logistics operations efficiently</p>
      </div>

      {/* Quick Overview */}
      <h2 className="text-xl font-bold mb-4">Quick Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FiUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Consignments"
          value={stats.activeConsignments}
          icon={MdLocalShipping}
          color="bg-orange-500"
        />
        <StatCard
          title="Available Drivers"
          value={stats.availableDrivers}
          icon={FiTruck}
          color="bg-green-500"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={FiCheckCircle}
          color="bg-purple-500"
        />
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          title="Register System Admin"
          icon={MdAdminPanelSettings}
          color="bg-red-500"
          href="/auth/admin/register"
        />
        <ActionCard
          title="Register Client/Driver"
          icon={FiUserPlus}
          color="bg-teal-500"
          href="/auth/register"
        />
        <ActionCard
          title="Register Other Admin"
          icon={MdSupervisorAccount}
          color="bg-indigo-500"
          href="/auth/other-admin"
        />
        <ActionCard
          title="Fuel Management"
          icon={MdLocalGasStation}
          color="bg-amber-500"
          href="/admin/fuel-transactions"
        />
        <ActionCard
          title="Delivery Management"
          icon={MdLocalShipping}
          color="bg-orange-500"
          href="/admin/consignments"
        />
        <ActionCard
          title="Settings"
          icon={FiSettings}
          color="bg-gray-500"
          href="/admin/settings"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  color: string
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg p-6 ${color} text-white`}>
      <div className="flex flex-col items-center justify-center space-y-2">
        <Icon className="h-8 w-8" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium text-center">{title}</div>
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  icon: any
  color: string
  href: string
}

function ActionCard({ title, icon: Icon, color, href }: ActionCardProps) {
  return (
    <a href={href} className="block">
      <div className={`rounded-lg p-6 ${color} text-white cursor-pointer transition-transform hover:scale-105`}>
        <div className="flex flex-col items-center justify-center space-y-2">
          <Icon className="h-8 w-8" />
          <div className="text-sm font-bold text-center">{title}</div>
        </div>
      </div>
    </a>
  )
}
