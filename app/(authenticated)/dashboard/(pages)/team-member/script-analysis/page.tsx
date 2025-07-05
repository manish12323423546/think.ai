import { SharedScriptAnalysis } from '@/components/think-ai/shared-script-analysis'

export default function TeamMemberScriptAnalysisPage() {
  return (
    <SharedScriptAnalysis 
      allowedRoles={['team_member', 'admin']}
      requiredPermission="thinkai:script-analysis:read"
    />
  )
}