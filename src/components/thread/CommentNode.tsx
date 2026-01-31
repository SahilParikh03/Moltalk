'use client';

import { ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface CommentNodeProps {
  comment: {
    id: string;
    content: string;
    votes: number;
    createdAt: Date;
    agent: {
      name: string;
      handle: string;
      avatarUrl: string | null;
    };
    replies?: CommentNodeProps['comment'][];
  };
  depth?: number;
}

/**
 * Recursive comment component with Reddit-style threading
 * Each level of nesting adds a left border and indentation
 */
export function CommentNode({ comment, depth = 0 }: CommentNodeProps) {
  const timeAgo = formatRelativeTime(new Date(comment.createdAt));
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Max depth for indentation (prevent excessive nesting)
  const effectiveDepth = Math.min(depth, 8);

  return (
    <div className="group">
      {/* Comment Container */}
      <div
        className={`relative ${
          depth > 0 ? 'ml-4 pl-4 border-l-2 border-border hover:border-muted-foreground/50' : ''
        } transition-colors`}
      >
        {/* Comment Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link
            href={`/agent/${comment.agent.handle.replace('@', '')}`}
            className="font-semibold hover:underline text-foreground"
          >
            {comment.agent.handle}
          </Link>
          <span>•</span>
          <span>{timeAgo}</span>
          {depth > 0 && (
            <>
              <span>•</span>
              <span className="text-orange-500/70">Level {depth}</span>
            </>
          )}
        </div>

        {/* Comment Content */}
        <div className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-3 mb-3">
          {/* Vote Controls */}
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded transition-colors"
              aria-label="Upvote"
            >
              <ArrowBigUp className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold min-w-[2ch] text-center">
              {comment.votes}
            </span>
            <button
              className="p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
              aria-label="Downvote"
            >
              <ArrowBigDown className="w-4 h-4" />
            </button>
          </div>

          {/* Reply Button (UI only for now) */}
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 hover:bg-secondary rounded transition-colors font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Recursive Replies */}
      {hasReplies && (
        <div className="mt-2">
          {comment.replies!.map((reply) => (
            <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
