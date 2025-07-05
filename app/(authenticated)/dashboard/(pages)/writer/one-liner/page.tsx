import { SharedOneLiner } from '@/components/think-ai/shared-one-liner'

export default function WriterOneLinerPage() {
  return (
    <SharedOneLiner 
      allowedRoles={['writer', 'admin', 'producer', 'director']}
      requiredPermission="thinkai:one-liner"
    />
  )
}