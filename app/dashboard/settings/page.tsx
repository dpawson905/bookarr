'use client'

import { useState } from 'react'
import { useSettingsInitialization } from '@/hooks/useSettingsInitialization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ApiKeysSettings from '@/components/settings/ApiKeysSettings'
import IndexerSettings from '@/components/settings/IndexerSettings'
import { 
  Settings, 
  Download, 
  User, 
  Bell,
  FolderOpen,
  Wifi,
  Key
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  // These paths are set via Docker volumes and cannot be changed in the UI
  const libraryPath = '/books'
  const downloadPath = '/downloads'
  
  // Initialize settings (loads API keys)
  useSettingsInitialization()

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'library', label: 'Library', icon: FolderOpen },
    { id: 'indexers', label: 'Indexers', icon: Wifi },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Bookarr instance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic application configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">Application Name</Label>
                    <Input id="app-name" defaultValue="Bookarr" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-start" />
                    <Label htmlFor="auto-start">Start with system</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="minimize-tray" />
                    <Label htmlFor="minimize-tray">Minimize to system tray</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'api-keys' && <ApiKeysSettings />}

          {activeTab === 'downloads' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Download Clients</CardTitle>
                  <CardDescription>
                    Configure your download clients (SABnzbd, NZBGet)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-type">Download Client</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="sabnzbd">SABnzbd</option>
                      <option value="nzbget">NZBGet</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host</Label>
                      <Input id="host" placeholder="localhost" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input id="port" type="number" placeholder="8080" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Your API key" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="books" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="ssl-enabled" />
                    <Label htmlFor="ssl-enabled">Use SSL</Label>
                  </div>

                  <Button>Test Connection</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Library Settings</CardTitle>
                  <CardDescription>
                    Library paths are configured via Docker volumes and cannot be changed here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="library-path">Library Path</Label>
                    <div className="relative">
                      <Input
                        id="library-path"
                        value={libraryPath}
                        readOnly
                        className="bg-muted"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Docker Volume
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mapped to: <code className="bg-muted px-1 rounded">./data/books:/books</code>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="download-path">Download Path</Label>
                    <div className="relative">
                      <Input
                        id="download-path"
                        value={downloadPath}
                        readOnly
                        className="bg-muted"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Docker Volume
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mapped to: <code className="bg-muted px-1 rounded">./data/downloads:/downloads</code>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="naming-scheme">File Naming Scheme</Label>
                    <Input id="naming-scheme" placeholder="{Author} - {Title} ({Year})" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folder-scheme">Folder Organization</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="author">By Author</option>
                      <option value="series">By Series</option>
                      <option value="flat">Flat Structure</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-organize" />
                    <Label htmlFor="auto-organize">Auto-organize new downloads</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="duplicate-detection" />
                    <Label htmlFor="duplicate-detection">Enable duplicate detection</Label>
                  </div>

                  <div className="pt-4">
                    <div className="text-sm text-muted-foreground">
                      💡 To change these paths, update your <code className="bg-muted px-1 rounded">docker-compose.yml</code> file and restart the container
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'indexers' && <IndexerSettings />}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch id="email-notifications" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="download-complete">Download Complete</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when downloads finish
                        </p>
                      </div>
                      <Switch id="download-complete" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="download-failed">Download Failed</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when downloads fail
                        </p>
                      </div>
                      <Switch id="download-failed" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="new-book-available">New Book Available</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when new books are found
                        </p>
                      </div>
                      <Switch id="new-book-available" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input id="email-address" type="email" placeholder="your@email.com" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="admin" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button>Update Account</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
