import { SharedScriptAnalysis } from '@/components/think-ai/shared-script-analysis'

export default function StoryboardArtistScriptAnalysisPage() {
  return (
    <SharedScriptAnalysis 
      allowedRoles={['storyboard_artist', 'admin']}
      requiredPermission="thinkai:script-analysis:read"
    />
  )
}