import AuthGuard from '@/components/admin/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
