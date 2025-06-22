"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Edit, Film, Palette, Trophy, Users, CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Roles } from "@/types/globals"
import { ROLE_PERMISSIONS } from "@/lib/roles"
import { updateCurrentUserRole } from "@/actions/users"

const roles = [
  {
    id: 'admin' as Roles,
    name: 'Admin/Owner',
    description: 'Complete control over projects, users, and all system features',
    icon: Crown,
    features: ['User management', 'All module access', 'Analytics & reporting', 'System settings'],
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    recommended: false
  },
  {
    id: 'writer' as Roles,
    name: 'Writer',
    description: 'Focus on script creation and story development',
    icon: Edit,
    features: ['Script creation & editing', 'Story development', 'Version control', 'Collaboration tools'],
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    recommended: true
  },
  {
    id: 'producer' as Roles,
    name: 'Producer',
    description: 'Project management and team coordination',
    icon: Film,
    features: ['Project oversight', 'Team management', 'Budget tracking', 'Progress monitoring'],
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    recommended: false
  },
  {
    id: 'storyboard_artist' as Roles,
    name: 'Storyboard Artist',
    description: 'Visual storytelling and artistic direction',
    icon: Palette,
    features: ['Storyboard creation', 'Visual planning', 'Asset management', 'Creative tools'],
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
    recommended: false
  },
  {
    id: 'director' as Roles,
    name: 'Director',
    description: 'Creative leadership and project direction',
    icon: Trophy,
    features: ['Creative oversight', 'Script approval', 'Team direction', 'Final decisions'],
    color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    recommended: false
  },
  {
    id: 'team_member' as Roles,
    name: 'Team Member',
    description: 'General access for team collaboration',
    icon: Users,
    features: ['Project viewing', 'Basic collaboration', 'Task participation', 'Communication'],
    color: 'bg-gradient-to-br from-gray-500 to-slate-500',
    recommended: false
  }
]

export default function RoleSelectionPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/signup')
    }
  }, [isLoaded, user, router])

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return

    setIsUpdating(true)
    try {
      // Update user metadata securely on the server
      await updateCurrentUserRole(selectedRole)

      // Refresh user data
      await user.reload()

      // Wait for the update to complete
      await user.reload()

      toast.success(`Role updated to ${roles.find(r => r.id === selectedRole)?.name}!`)
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)

    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('Failed to update role. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <motion.div
        className="text-center space-y-4 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your Creative Studio! ✨
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose your role to customize your experience and unlock the right tools for your creative journey.
        </p>
        <Badge variant="secondary" className="px-3 py-1">
          You can change this anytime in your settings
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedRole === role.id 
                  ? 'ring-2 ring-primary ring-offset-2 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              {role.recommended && (
                <Badge 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${role.color} text-white`}>
                    <role.icon className="h-6 w-6" />
                  </div>
                  {selectedRole === role.id && (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <CardDescription className="text-sm">
                  {role.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isUpdating}
          className="px-8 py-3 text-lg min-w-[200px]"
          size="lg"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.name : 'User'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        {selectedRole && (
          <motion.p
            className="text-sm text-muted-foreground text-center max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            As a <strong>{roles.find(r => r.id === selectedRole)?.name}</strong>, you'll have access to{' '}
            <strong>{ROLE_PERMISSIONS[selectedRole].length}</strong> features to help you create amazing content.
          </motion.p>
        )}
      </motion.div>
    </div>
  )
} 