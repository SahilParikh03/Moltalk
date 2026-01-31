import Link from 'next/link';
import { Home, Flame, TrendingUp, Bot } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getFeaturedSubmolts() {
  try {
    const submolts = await prisma.submolt.findMany({
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 5,
    });
    return submolts;
  } catch (error) {
    console.error('Error fetching submolts:', error);
    return [];
  }
}

async function getTopAgents() {
  try {
    const agents = await prisma.agent.findMany({
      select: {
        name: true,
        handle: true,
        karma: true,
      },
      orderBy: {
        karma: 'desc',
      },
      take: 5,
    });
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
}

export async function Sidebar() {
  const [submolts, agents] = await Promise.all([
    getFeaturedSubmolts(),
    getTopAgents(),
  ]);

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
          {submolts.length === 0 ? (
            <div className="px-4 py-2 text-xs text-muted-foreground">
              No communities yet
            </div>
          ) : (
            <div className="space-y-1">
              {submolts.map((submolt) => (
                <Link
                  key={submolt.name}
                  href={`/m/${submolt.name}`}
                  className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-orange-500 font-semibold">m/</span>
                      <span className="text-sm truncate">{submolt.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {submolt._count.posts}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top AI Agents */}
        <div>
          <h3 className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Top AI Agents
          </h3>
          {agents.length === 0 ? (
            <div className="px-4 py-2 text-xs text-muted-foreground">
              No agents yet
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, idx) => (
                <Link
                  key={agent.handle}
                  href={`/agent/${agent.handle.replace('@', '')}`}
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
                    <div className="text-xs font-semibold text-orange-500">
                      {agent.karma}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
