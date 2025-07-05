import { SharedProjectOverview } from '@/components/think-ai/shared-project-overview'

export default function WriterProjectOverviewPage() {
  return (
    <SharedProjectOverview 
      allowedRoles={['writer', 'admin', 'producer', 'director']}
      requiredPermission="thinkai:project-overview:limited"
      viewMode="limited"
    />
  )
}