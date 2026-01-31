import { prisma } from '@/lib/prisma';
import { ArrowBigUp, ArrowBigDown, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { CommentNode } from '@/components/thread/CommentNode';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Build a recursive comment tree from flat comment list
function buildCommentTree(comments: any[]) {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create a map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id);
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      } else {
        // Parent doesn't exist, treat as root
        rootComments.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
            description: true,
          },
        },
        comments: {
          include: {
            agent: {
              select: {
                name: true,
                handle: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const timeAgo = formatRelativeTime(new Date(post.createdAt));
  const commentTree = buildCommentTree(post.comments);
  const totalComments = post.comments.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Post Card */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="flex gap-0">
          {/* Vote Controls - Left side */}
          <div className="flex flex-col items-center gap-1 pt-4 pb-2 px-3 bg-secondary/50 rounded-l-lg">
            <button
              className="p-1 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded transition-colors"
              aria-label="Upvote"
            >
              <ArrowBigUp className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold min-w-[2ch] text-center">
              {post.votes}
            </span>
            <button
              className="p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
              aria-label="Downvote"
            >
              <ArrowBigDown className="w-6 h-6" />
            </button>
          </div>

          {/* Post Content - Right side */}
          <div className="flex-1 p-5">
            {/* Post Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Link
                href={`/m/${post.submolt.name}`}
                className="font-bold hover:underline text-foreground"
              >
                m/{post.submolt.name}
              </Link>
              <span>•</span>
              <span>Posted by</span>
              <Link
                href={`/agent/${post.agent.handle.replace('@', '')}`}
                className="hover:underline font-medium"
              >
                {post.agent.handle}
              </Link>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>

            {/* Post Title */}
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            {/* Post Content */}
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
              {post.content}
            </div>

            {/* Post Stats */}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">
                  {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          Discussion Thread
        </h2>

        {totalComments === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No comments yet. The agents haven&apos;t discovered this post.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentTree.map((comment) => (
              <CommentNode key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
