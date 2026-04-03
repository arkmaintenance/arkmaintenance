'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  ClipboardList,
  Briefcase,
  FileCheck,
  Mail,
  BarChart3,
  FileBarChart,
  DollarSign,
  Users,
  Wrench,
  UserPlus,
  Trash2,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Quotations', href: '/admin/quotations', icon: ClipboardList },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Service Contracts', href: '/admin/service-contracts', icon: FileCheck },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
  { name: 'Analytics', href: '/admin/reports', icon: BarChart3 },
  { name: 'Client Reports', href: '/admin/client-reports', icon: FileBarChart },
  { name: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Technicians', href: '/admin/technicians', icon: Wrench },
  { name: 'Leads', href: '/admin/leads', icon: UserPlus },
  { name: 'New Applications', href: '/admin/applications', icon: ClipboardList },
  { name: 'Trash', href: '/admin/trash', icon: Trash2 },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
      return
    }
    toast.success('Signed out successfully')
    router.push('/auth/login')
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen overflow-hidden bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center">
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={150}
              height={60}
              loading="eager"
              priority
              style={{ width: 'auto', height: '40px' }}
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#00BFFF]/20 text-[#00BFFF]'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[#00BFFF]')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
          title={collapsed ? 'Back to Website' : undefined}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to Website</span>}
        </Link>
        <Link
          href="/admin/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'px-3'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
