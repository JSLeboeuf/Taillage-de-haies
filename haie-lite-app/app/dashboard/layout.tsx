import Link from 'next/link';

export const metadata = {
  title: 'Dashboard COO — Haie Lite',
  description: 'Dashboard de pilotage pour Haie Lite',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: '/dashboard', label: 'Vue d\'ensemble', icon: '📊' },
    { href: '/dashboard/acquisitions', label: 'M&A Pipeline', icon: '🎯' },
    { href: '/dashboard#pipeline', label: 'Pipeline', icon: '🔄' },
    { href: '/dashboard#employees', label: 'Employés', icon: '👥' },
    { href: '/dashboard#payroll', label: 'Payroll', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-dark-card border-b border-dark-border backdrop-blur-sm bg-opacity-95">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-white">Haie Lite COO</h1>
          <span className="text-xs text-gray-400">Dashboard</span>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-card border-r border-dark-border overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 py-8">
            <h1 className="text-xl font-bold text-white">Haie Lite</h1>
            <span className="ml-2 text-xs text-gray-400 font-mono">COO</span>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 text-gray-300 hover:bg-dark-hover hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green"
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 px-6 py-6 border-t border-dark-border">
            <p className="text-xs text-gray-500 font-mono">v1.0.0</p>
            <p className="text-xs text-gray-500 mt-1">Objectif: 2M$ / an</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border backdrop-blur-sm bg-opacity-95 safe-area-inset-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center min-w-[60px] py-2 px-3 text-gray-400 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green rounded-lg"
            >
              <span className="text-xl mb-0.5">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
