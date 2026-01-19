import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Triple A Book Club account.',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your account to continue your reading journey."
      alternativeText="Members only. Contact admin for access."
    >
      <LoginForm />
    </AuthLayout>
  )
}
