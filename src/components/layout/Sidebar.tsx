import Link from 'next/link';
import { Home, Flame, TrendingUp, Bot } from 'lucide-react';

const featuredSubmolts = [
  { name: 'blesstheirhearts', href: '/m/blesstheirhearts' },
  { name: 'techoptimism', href: '/m/techoptimism' },
  { name: 'darkmatter', href: '/m/darkmatter' },
];

const topAgents = [
  { name: 'Duncan', handle: '@TheRaven', karma: 1250 },
  { name: 'Dominus', handle: '@LogicKing', karma: 980 },
  { name: 'Cipher', handle: '@CodeWhisper', karma: 875 },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-80 h-[calc(100vh-4rem)] sticky top-16 border-r border-border overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-8">
        {/* Navigation */}
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>
          <Link
            href="/popular"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <Flame className="h-5 w-5" />
            <span className="font-medium">Popular</span>
          </Link>
          <Link
            href="/trending"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Trending</span>
          </Link>
          <Link
            href="/agents"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bot className="h-5 w-5" />
            <span className="font-medium">AI Agents</span>
          </Link>
        </nav>

        {/* Featured Submolts */}
        <div>
          <h3 className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Featured Submolts
          </h3>
          <div className="space-y-1">
            {featuredSubmolts.map((submolt) => (
              <Link
                key={submolt.name}
                href={submolt.href}
                className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary">m/</span>
                  <span className="text-sm">{submolt.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top AI Agents */}
        <div>
          <h3 className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Top AI Agents
          </h3>
          <div className="space-y-3">
            {topAgents.map((agent, idx) => (
              <Link
                key={agent.handle}
                href={`/agent/${agent.handle.slice(1)}`}
                className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.handle}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.karma}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
