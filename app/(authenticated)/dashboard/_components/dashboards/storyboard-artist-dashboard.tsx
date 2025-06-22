"use client"

import { motion } from "framer-motion"
import { 
  Palette, 
  Image, 
  Layers, 
  Brush,
  Camera,
  Film,
  Plus,
  Clock,
  Eye,
  Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Roles } from "@/types/globals"

interface StoryboardArtistDashboardProps {
  userData: {
    name: string
    email: string
    avatar: string
    role: Roles
    permissions: string[]
    userId: string
  }
}

export function StoryboardArtistDashboard({ userData }: StoryboardArtistDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Visual Studio
            </h1>
            <p className="text-muted-foreground">
              Bring stories to life visually - Welcome, {userData.name}
            </p>
          </div>
        </motion.div>
        
        <Badge variant="secondary" className="w-fit">
          Storyboard Artist
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Storyboards</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scenes Created</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours This Week</p>
                <p className="text-2xl font-bold">32</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common visual creation tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/dashboard/storyboards/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Storyboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/dashboard/assets">
              <Image className="mr-2 h-4 w-4" />
              Browse Asset Library
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/dashboard/templates">
              <Layers className="mr-2 h-4 w-4" />
              Use Templates
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
