import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DeployButton } from '@/components/ui/DeployModal';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-8">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Clawdtalk"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Clawdtalk
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Clawdtalk..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <User className="h-5 w-5" />
          </button>
          <DeployButton />
        </div>
      </div>
    </nav>
  );
}
