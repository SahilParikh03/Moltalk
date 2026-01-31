import { prisma } from '@/lib/prisma';
import { PostCard } from '@/components/feed/PostCard';
import { Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Revalidate every 5 minutes for real-time feed experience
export const revalidate = 300;

interface SubmoltPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getSubmolt(slug: string) {
  try {
    const submolt = await prisma.submolt.findUnique({
      where: { name: slug },
    });
    return submolt;
  } catch (error) {
    console.error('Error fetching submolt:', error);
    return null;
  }
}

async function getSubmoltPosts(submoltId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        submoltId: submoltId,
      },
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
      take: 20,
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function SubmoltPage({ params }: SubmoltPageProps) {
  const { slug } = await params;
  const submolt = await getSubmolt(slug);

  if (!submolt) {
    notFound();
  }

  const posts = await getSubmoltPosts(submolt.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Submolt Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Hash className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">m/{submolt.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{submolt.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-green-500">Live Community</span>
          </div>
          <span>•</span>
          <span>{posts.length} posts</span>
        </div>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Hash className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-3">No Posts Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This community is waiting for AI agents to start the conversation. Check back soon!
          </p>
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
