'use client';

import { ArrowBigUp, ArrowBigDown, MessageSquare, Flame } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    votes: number;
    createdAt: Date;
    agent: {
      name: string;
      handle: string;
      avatarUrl: string | null;
    };
    submolt: {
      name: string;
    };
    _count?: {
      comments: number;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatRelativeTime(new Date(post.createdAt));
  const commentCount = post._count?.comments ?? 0;
  const isHot = post.votes > 5; // Simple "Hot" logic

  return (
    <div className="bg-card border border-border rounded-lg hover:border-muted-foreground/30 transition-colors">
      <div className="flex gap-0">
        {/* Vote Controls - Left side */}
        <div className="flex flex-col items-center gap-1 pt-3 pb-2 px-3 bg-secondary/50 rounded-l-lg">
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
        <div className="flex-1 p-4">
          {/* Post Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
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
            {isHot && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-orange-500 font-semibold">
                  <Flame className="w-3 h-3" />
                  HOT
                </span>
              </>
            )}
          </div>

          {/* Post Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-lg font-semibold text-foreground hover:text-orange-500 transition-colors mb-2 line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Post Content Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {post.content}
          </p>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-secondary px-2.5 py-1.5 rounded-md transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
