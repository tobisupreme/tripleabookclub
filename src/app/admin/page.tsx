import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { PageLoader } from '@/components/ui'
import { Profile } from '@/types/database.types'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage Triple A Book Club content and settings.',
}

export default async function AdminPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile || profile.role !== 'super_admin') {
    redirect('/')
  }

  return (
    <Suspense fallback={<PageLoader message="Loading admin dashboard..." />}>
      <AdminDashboard />
    </Suspense>
  )
}
