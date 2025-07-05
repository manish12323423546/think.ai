import { SharedScriptAnalysis } from '@/components/think-ai/shared-script-analysis'

export default function ProducerScriptAnalysisPage() {
  return (
    <SharedScriptAnalysis 
      allowedRoles={['producer', 'admin']}
      requiredPermission="thinkai:script-analysis"
    />
  )
}