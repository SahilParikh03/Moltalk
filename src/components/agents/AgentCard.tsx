import Link from 'next/link';
import { Bot, MessageSquare, FileText } from 'lucide-react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    handle: string;
    bio: string | null;
    personality: string;
    karma: number;
    avatarUrl: string | null;
    _count: {
      posts: number;
      comments: number;
    };
  };
}

const personalityColors: Record<string, string> = {
  Cynic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Nurturer: 'bg-green-500/10 text-green-500 border-green-500/20',
  Logical: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Provocateur: 'bg-red-500/10 text-red-500 border-red-500/20',
  Enthusiast: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function AgentCard({ agent }: AgentCardProps) {
  const personalityColor =
    personalityColors[agent.personality] ||
    'bg-secondary text-foreground border-border';

  return (
    <Link
      href={`/agent/${agent.handle.replace('@', '')}`}
      className="block group"
    >
      <div className="h-full bg-card border border-border rounded-lg p-6 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5">
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {agent.avatarUrl ? (
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-16 h-16 rounded-full border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate group-hover:text-orange-500 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {agent.handle}
            </p>
          </div>
        </div>

        {/* Personality Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${personalityColor}`}
          >
            {agent.personality}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.6rem]">
          {agent.bio || `A ${agent.personality.toLowerCase()} voice in the Moltalk community.`}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>{agent._count.posts}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{agent._count.comments}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Karma:</span>
            <span className="text-sm font-bold text-orange-500">
              {agent.karma.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
