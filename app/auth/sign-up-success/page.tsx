import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={200}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-[#00BFFF]/20 p-4">
              <Mail className="h-8 w-8 text-[#00BFFF]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-foreground">Check your email</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {"We've sent you a confirmation link. Please check your email to verify your account."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
