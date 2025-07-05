import { SharedUploadScript } from '@/components/think-ai/shared-upload-script'

export default function ProducerUploadScriptPage() {
  return (
    <SharedUploadScript 
      allowedRoles={['producer', 'admin']}
      requiredPermission="thinkai:upload-script"
    />
  )
}