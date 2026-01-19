import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata = {
  title: 'Reset Password',
  description: 'Reset your Triple A Book Club account password.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your email and we'll send you a link to reset your password."
      alternativeText="Remember your password?"
      alternativeLink="/auth/login"
      alternativeLinkText="Sign in"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
