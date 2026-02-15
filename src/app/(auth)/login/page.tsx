import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="lg:p-8">
                <LoginForm />
            </div>
        </div>
    )
}
