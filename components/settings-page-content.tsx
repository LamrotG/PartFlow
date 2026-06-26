'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save } from 'lucide-react'
import { updateProfileAction, changePasswordAction } from '@/app/(dashboard)/settings/actions'
import type { Profile } from '@/lib/types/database'

export function SettingsPageContent({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleProfileSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.error) setMessage({ type: 'error', text: result.error })
      else setMessage({ type: 'success', text: 'Profile updated' })
    })
  }

  function handlePasswordSubmit(formData: FormData) {
    setPwMessage(null)
    startTransition(async () => {
      const result = await changePasswordAction(formData)
      if (result.error) setPwMessage({ type: 'error', text: result.error })
      else setPwMessage({ type: 'success', text: 'Password changed' })
    })
  }

  return (
    <>
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-2xl">
          <form action={handleProfileSubmit}>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Your Profile</h2>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <Input id="fullName" name="fullName" defaultValue={profile.full_name} className="bg-secondary border-border" />
              </div>
              <div>
                <label htmlFor="settingsEmail" className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input id="settingsEmail" type="email" value={profile.email} disabled className="bg-secondary border-border opacity-60" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <Input id="phone" name="phone" defaultValue={profile.phone || ''} className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <Input value={profile.role} disabled className="bg-secondary border-border opacity-60 capitalize" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                  <Input value={profile.department || '—'} disabled className="bg-secondary border-border opacity-60" />
                </div>
              </div>
              {message && (
                <div className={`text-sm px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                  {message.text}
                </div>
              )}
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>

          <form action={handlePasswordSubmit}>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">New Password</label>
                <Input id="newPassword" name="password" type="password" placeholder="Enter new password" minLength={6} required className="bg-secondary border-border" />
              </div>
              {pwMessage && (
                <div className={`text-sm px-4 py-3 rounded-lg ${pwMessage.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                  {pwMessage.text}
                </div>
              )}
              <Button type="submit" disabled={isPending} variant="outline" className="text-foreground">
                {isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
