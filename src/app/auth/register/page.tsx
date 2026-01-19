import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Registration Closed',
  description: 'Registration for Triple A Book Club is by invitation only.',
}

export default function RegisterPage() {
  // Registration is admin-only, redirect to login
  redirect('/auth/login')
}
