import { SharedScriptAnalysis } from '@/components/think-ai/shared-script-analysis'

export default function DirectorScriptAnalysisPage() {
  return (
    <SharedScriptAnalysis 
      allowedRoles={['director', 'admin']}
      requiredPermission="thinkai:script-analysis"
    />
  )
}