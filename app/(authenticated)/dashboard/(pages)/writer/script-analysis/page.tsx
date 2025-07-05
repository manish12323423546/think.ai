import { SharedScriptAnalysis } from '@/components/think-ai/shared-script-analysis'

export default function WriterScriptAnalysisPage() {
  return (
    <SharedScriptAnalysis 
      allowedRoles={['writer', 'admin', 'producer', 'director']}
      requiredPermission="thinkai:script-analysis"
    />
  )
}