import { SignedMediaImage } from '@/shared/ui/SignedMediaImage'
import { useUserAvatar } from '../hooks/use-user-avatar'

export function UserAvatar({ userId, name }: { userId: string; name: string }) {
  const { data } = useUserAvatar(userId)
  const fallback = name.trim().charAt(0).toUpperCase() || 'N'

  return data?.mediaId
    ? <SignedMediaImage key={data.mediaId} mediaId={data.mediaId} scope={`avatar:${userId}`} alt="" className="block h-full w-full rounded-full object-cover" fallback={fallback} />
    : fallback
}
