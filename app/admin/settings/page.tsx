import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader title="Settings" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account and business settings.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Building className="mr-2 h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">First Name</Label>
                    <Input className="bg-input border-border text-foreground" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Last Name</Label>
                    <Input className="bg-input border-border text-foreground" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <Input className="bg-input border-border text-foreground" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Phone</Label>
                  <Input className="bg-input border-border text-foreground" placeholder="+1 (876) 555-0123" />
                </div>
                <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Business Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your company details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Company Name</Label>
                  <Input className="bg-input border-border text-foreground" defaultValue="ARK Maintenance Ltd" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Business Address</Label>
                  <Input className="bg-input border-border text-foreground" placeholder="123 Main Street" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">City</Label>
                    <Input className="bg-input border-border text-foreground" placeholder="Kingston" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Parish</Label>
                    <Input className="bg-input border-border text-foreground" placeholder="Kingston" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Tax ID / TRN</Label>
                  <Input className="bg-input border-border text-foreground" placeholder="000-000-000" />
                </div>
                <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications for new leads', description: 'Get notified when a new lead is added' },
                    { label: 'Invoice payment reminders', description: 'Receive alerts for overdue invoices' },
                    { label: 'Job schedule reminders', description: 'Daily digest of upcoming jobs' },
                    { label: 'Contract expiration alerts', description: 'Get notified before contracts expire' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button variant="outline" className="border-border text-foreground">
                        Enable
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Security Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Current Password</Label>
                  <Input className="bg-input border-border text-foreground" type="password" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">New Password</Label>
                  <Input className="bg-input border-border text-foreground" type="password" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Confirm New Password</Label>
                  <Input className="bg-input border-border text-foreground" type="password" />
                </div>
                <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
