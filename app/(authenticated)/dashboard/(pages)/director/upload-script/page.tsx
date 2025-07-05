import { SharedUploadScript } from '@/components/think-ai/shared-upload-script'

export default function DirectorUploadScriptPage() {
  return (
    <SharedUploadScript 
      allowedRoles={['director', 'admin']}
      requiredPermission="thinkai:upload-script"
    />
  )
}