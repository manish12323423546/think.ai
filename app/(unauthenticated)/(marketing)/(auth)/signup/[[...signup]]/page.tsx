"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Star, Users, BookOpen, Trophy, CheckCircle, Film, Palette, Edit, Crown } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

const roles = [
  {
    id: 'admin',
    name: 'Admin/Owner',
    description: 'Full access to all features and user management',
    icon: Crown,
    features: ['Complete project control', 'User management', 'Analytics & reporting', 'All modules access']
  },
  {
    id: 'writer',
    name: 'Writer',
    description: 'Specialized in script writing and story development',
    icon: Edit,
    features: ['Script creation & editing', 'Story development tools', 'Collaboration features', 'Version control']
  },
  {
    id: 'producer',
    name: 'Producer',
    description: 'Project management and oversight capabilities',
    icon: Film,
    features: ['Project creation', 'Team coordination', 'Budget tracking', 'Analytics access']
  },
  {
    id: 'storyboard_artist',
    name: 'Storyboard Artist',
    description: 'Visual storytelling and storyboard creation',
    icon: Palette,
    features: ['Storyboard creation', 'Visual planning tools', 'Asset management', 'Collaboration features']
  },
  {
    id: 'director',
    name: 'Director',
    description: 'Creative direction and project oversight',
    icon: Trophy,
    features: ['Creative oversight', 'Script review', 'Storyboard approval', 'Team coordination']
  },
  {
    id: 'team_member',
    name: 'Team Member',
    description: 'General team access with view permissions',
    icon: Users,
    features: ['Project viewing', 'Basic collaboration', 'Task assignments', 'Communication tools']
  }
]

export default function SignUpPage() {
  const { theme } = useTheme()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [showSignup, setShowSignup] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setShowSignup(true)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left side - Role Selection */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose Your Role
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Select your role first, then complete the signup form. You can always change this later.
            </motion.p>
          </div>

          {/* Role Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer group ${
                  selectedRole === role.id 
                    ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' 
                    : 'border-border hover:bg-accent/50 hover:border-primary/50 hover:shadow-md'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    selectedRole === role.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted group-hover:bg-primary/10'
                  }`}>
                    <role.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{role.name}</h3>
                      {selectedRole === role.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    <ul className="space-y-1">
                      {role.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                      {!showSignup && (
                        <li className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2 pt-2 border-t border-border/30">
                          ✨ Click to start signup
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!showSignup && (
            <motion.div
              className="bg-muted rounded-lg p-4 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Get Started
              </h4>
              <p className="text-xs text-muted-foreground">
                Click on any role above to reveal the signup form and create your account with the right permissions.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Right side - Clerk Sign Up */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-full max-w-md">
            {!showSignup ? (
              <motion.div
                className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center space-y-4">
                  <div className="text-6xl">👈</div>
                  <h3 className="text-lg font-semibold">Select Your Role First</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose the role that best describes your responsibilities to customize your signup experience.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
                  <p className="text-sm text-muted-foreground">
                    Complete the form below to get started as a{" "}
                    <span className="font-medium text-primary">
                      {roles.find(r => r.id === selectedRole)?.name}
                    </span>
                  </p>
                </div>
                
                <motion.div
                  className="relative"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <SignUp
                    appearance={{
                      baseTheme: theme === "dark" ? dark : undefined,
                      variables: {
                        colorPrimary: "#0070f3",
                        colorBackground: theme === "dark" ? "#000000" : "#ffffff",
                        colorText: theme === "dark" ? "#ffffff" : "#000000",
                        colorInputBackground: theme === "dark" ? "#111111" : "#ffffff",
                        colorInputText: theme === "dark" ? "#ffffff" : "#000000",
                        borderRadius: "0.5rem"
                      },
                      elements: {
                        formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                        card: "shadow-lg border",
                        headerTitle: theme === "dark" ? "text-white" : "text-black",
                        headerSubtitle: theme === "dark" ? "text-gray-300" : "text-gray-600",
                        socialButtonsIconButton: "border hover:bg-gray-100",
                        formFieldInput: "border focus:border-blue-500",
                        footerActionLink: "text-blue-600 hover:text-blue-700"
                      }
                    }}
                    unsafeMetadata={{
                      role: selectedRole
                    }}
                    afterSignUpUrl="/role-selection"
                    redirectUrl="/role-selection"
                  />
                </motion.div>
                
                {selectedRole && (
                  <motion.div 
                    className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <p className="text-xs text-muted-foreground text-center">
                      🎯 You'll be set up as a <strong className="text-primary">{roles.find(r => r.id === selectedRole)?.name}</strong> with the right permissions
                    </p>
                  </motion.div>
                )}
                
                <motion.button
                  className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full text-center"
                  onClick={() => {
                    setSelectedRole('')
                    setShowSignup(false)
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  ← Change role selection
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
