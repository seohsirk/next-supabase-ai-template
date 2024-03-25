import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/avatar';

type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps = SessionProps | TextProps;

export function ProfileAvatar(props: ProfileAvatarProps) {
  const avatarClassName = 'mx-auto w-9 h-9 group-focus:ring-2';

  if ('text' in props) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback>
          <span className={'uppercase'}>{props.text.slice(0, 2)}</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 2);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={props.pictureUrl ?? undefined} />

      <AvatarFallback>
        <span suppressHydrationWarning className={'uppercase'}>
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
