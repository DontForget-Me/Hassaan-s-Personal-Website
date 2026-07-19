import ClientAuthGuard from '@/components/client/ClientAuthGuard';
import DashboardNav from '@/components/client/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGuard>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <DashboardNav />
        <main className="flex-1">{children}</main>
      </div>
    </ClientAuthGuard>
  );
}
