import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  avatarUrl: string | null;
  fullName: string;
  className?: string;
}

export function UserAvatar({ avatarUrl, fullName, className }: UserAvatarProps) {
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} alt={fullName} />
      <AvatarFallback>{initials || '?'}</AvatarFallback>
    </Avatar>
  );
}
