'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { isAuthenticatedSession } from '@/types/session'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSettingsInitialization } from '@/hooks/useSettingsInitialization'
import { 
  BookOpen, 
  Download, 
  Settings, 
  User, 
  Menu, 
  X,
  Home,
  Search,
  LogOut,
  ChevronDown
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Books', href: '/dashboard/books', icon: BookOpen },
  { name: 'Authors', href: '/dashboard/authors', icon: User },
  { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  // Initialize settings when the app loads
  useSettingsInitialization()

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold">Bookarr</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold">Bookarr</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Centered search and user menu */}
          <div className="flex flex-1 items-center justify-center gap-4">
            <div className="relative flex items-center max-w-md w-full">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
              <input
                type="text"
                placeholder="Search books, authors, or series..."
                className="block h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-5 w-5" />
                    <span className="hidden sm:block">
                      {isAuthenticatedSession(session) 
                        ? session.user.name || session.user.email || 'User'
                        : 'User'
                      }
                    </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                          {isAuthenticatedSession(session) 
                            ? session.user.name || session.user.email
                            : 'User'
                          }
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">
              <div className="px-2 sm:px-0">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}