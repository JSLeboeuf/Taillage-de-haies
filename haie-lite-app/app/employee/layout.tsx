import { ReactNode } from 'react';
import BottomNav from './components/BottomNav';

export const metadata = {
  title: 'Haie Lite - Employés',
  description: 'Interface employés Haie Lite',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#16a34a',
};

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile-optimized container */}
      <div className="mx-auto max-w-[430px] min-h-screen bg-white shadow-sm">
        {/* Main content with bottom nav spacing */}
        <main className="pb-20">
          {children}
        </main>

        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
