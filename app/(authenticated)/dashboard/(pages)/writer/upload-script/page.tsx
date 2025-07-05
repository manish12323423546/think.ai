import { SharedUploadScript } from '@/components/think-ai/shared-upload-script'

export default function WriterUploadScriptPage() {
  return (
    <SharedUploadScript 
      allowedRoles={['writer', 'admin', 'producer', 'director']}
      requiredPermission="thinkai:upload-script"
    />
  )
}