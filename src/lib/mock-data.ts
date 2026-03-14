import { Post, User } from "@/types";

export const currentUser: User = {
  id: "1",
  name: "自分",
  handle: "@myself",
  avatarColor: "bg-blue-500",
};

const users: User[] = [
  currentUser,
  { id: "2", name: "田中太郎", handle: "@tanaka", avatarColor: "bg-green-500" },
  { id: "3", name: "佐藤花子", handle: "@sato_h", avatarColor: "bg-purple-500" },
  { id: "4", name: "鈴木一郎", handle: "@suzuki", avatarColor: "bg-orange-500" },
  { id: "5", name: "高橋美咲", handle: "@takahashi", avatarColor: "bg-pink-500" },
];

export const initialPosts: Post[] = [
  {
    id: "1",
    user: users[1],
    content: "今日はいい天気ですね！散歩に行ってきます。",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    likes: 3,
    isLiked: false,
    imageUrl: "https://picsum.photos/seed/sunny/600/400",
  },
  {
    id: "2",
    user: users[2],
    content: "Next.jsの勉強を始めました。App Routerが便利すぎる！",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 12,
    isLiked: true,
  },
  {
    id: "3",
    user: users[3],
    content: "新しいカフェを見つけました。コーヒーが美味しくて最高です。写真撮り忘れた...",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    likes: 7,
    isLiked: false,
  },
  {
    id: "4",
    user: users[4],
    content: "TypeScriptの型システム、奥が深い。最近ジェネリクスの使い方がやっと分かってきた気がする。",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 20,
    isLiked: false,
  },
  {
    id: "5",
    user: users[1],
    content: "お昼ご飯何にしようかな。ラーメンかカレーで迷っています。",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 5,
    isLiked: false,
  },
];
