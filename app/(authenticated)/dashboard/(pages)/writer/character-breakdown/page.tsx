import { SharedCharacterBreakdown } from '@/components/think-ai/shared-character-breakdown'

export default function WriterCharacterBreakdownPage() {
  return (
    <SharedCharacterBreakdown 
      allowedRoles={['writer', 'admin', 'producer', 'director']}
      requiredPermission="thinkai:character-breakdown:read"
      readOnly={true}
    />
  )
}