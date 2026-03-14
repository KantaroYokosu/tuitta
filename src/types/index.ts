export type User = {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarImage?: string;
};

export type Post = {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  reposts: number;
  isReposted: boolean;
  comments: number;
  imageUrl?: string;
  repostedBy?: string;
};
