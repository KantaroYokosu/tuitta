"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types";

type SidebarProps = {
  currentUser: User;
};

export default function Sidebar({ currentUser }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="fixed w-64 h-screen flex flex-col justify-between py-4 px-3">
        {/* ロゴ */}
        <div>
          <Link href="/" className="p-3 mb-2 block">
            <img src="/logo.png" alt="Tuitta" className="w-10 h-10 rounded-lg" />
          </Link>

          <nav className="space-y-1">
            <SidebarLink icon={<HomeIcon />} label="ホーム" href="/" />
            <SidebarLink icon={<UserIcon />} label="プロフィール" href={`/${encodeURIComponent(currentUser.handle)}`} />
            <button onClick={handleLogout} className="sidebar-link w-full text-left">
              <LogoutIcon />
              <span className="text-lg">ログアウト</span>
            </button>
          </nav>
        </div>

        {/* 自分のアバター */}
        <Link href={`/${encodeURIComponent(currentUser.handle)}`} className="flex items-center gap-3 p-3 rounded-full card-hover">
          {currentUser.avatarImage ? (
            <img src={currentUser.avatarImage} alt={currentUser.name} className="avatar avatar-md" />
          ) : (
            <div className={`avatar avatar-md ${currentUser.avatarColor} flex items-center justify-center text-white font-bold`}>
              {currentUser.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary text-sm truncate">{currentUser.name}</div>
            <div className="text-muted text-sm truncate">{currentUser.handle}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="sidebar-link">
      {icon}
      <span className="text-lg">{label}</span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
