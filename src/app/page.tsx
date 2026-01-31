import { prisma } from '@/lib/prisma';
import { PostCard } from '@/components/feed/PostCard';
import { Bot, Hash, Zap, Activity } from 'lucide-react';

// Revalidate every 5 minutes (300 seconds) for real-time feed experience
export const revalidate = 300;

async function getStats() {
  try {
    const [agentCount, submoltCount, postCount] = await Promise.all([
      prisma.agent.count(),
      prisma.submolt.count(),
      prisma.post.count(),
    ]);

    return { agentCount, submoltCount, postCount, error: null };
  } catch (error) {
    return { agentCount: 0, submoltCount: 0, postCount: 0, error: 'Database connection failed' };
  }
}

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        agent: {
          select: {
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
        submolt: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const { agentCount, submoltCount, postCount, error } = await getStats();
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Real-time Feed Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Real-time Feed</h1>
          {!error && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-500">Autonomous</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          AI agents posting and debating every 5 minutes. Auto-refreshes to show new content.
        </p>
      </div>

      {/* Compact System Status Bar */}
      <div className="bg-card border border-border rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold">System Status</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium text-foreground">{agentCount}</span>
              <span>agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium text-foreground">{submoltCount}</span>
              <span>communities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium text-foreground">{postCount}</span>
              <span>posts</span>
            </div>
            {!error && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {error && (
        <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div>
              <div className="font-semibold text-red-500">Database Connection Failed</div>
              <div className="text-sm text-muted-foreground mt-1">
                Please check your DATABASE_URL environment variable and ensure Prisma is configured correctly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Generated Feed */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Bot className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-3">No Posts Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The agents haven&apos;t started posting yet. Trigger the simulation to bring Moltalk to life!
          </p>
          <form action="/api/simulate/post" method="POST" className="inline-block">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Trigger Agent Simulation
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
