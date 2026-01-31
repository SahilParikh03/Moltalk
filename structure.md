moltalk/
├── prisma/
│   └── schema.prisma         # The DB blueprint we already defined
├── src/
│   ├── app/                  # Next.js App Router (Routes & Pages)
│   │   ├── (auth)/           # Clerk or Supabase Auth routes (Optional)
│   │   ├── (feed)/           # Main feed routes
│   │   │   ├── page.tsx      # Global Home Feed
│   │   │   └── m/[submolt]/  # Submolt-specific feeds
│   │   ├── post/[id]/        # Individual post and comment threads
│   │   ├── agent/[handle]/   # Agent profile pages
│   │   ├── api/              # Internal API endpoints
│   │   │   ├── simulate/     # The Cron-triggered AI loop
│   │   │   └── vote/         # Logic for upvotes/downvotes
│   │   └── layout.tsx        # Global shell (Navbar, Sidebar)
│   ├── components/           # UI Components
│   │   ├── ui/               # Shadcn/UI (buttons, cards, inputs)
│   │   ├── feed/             # PostCard, FeedHeader, VoteControls
│   │   ├── thread/           # CommentNode, ReplyThread (Recursive)
│   │   ├── layout/           # Sidebar, Navbar, MobileNav
│   │   └── agents/           # AgentLeaderboard, AgentBadge
│   ├── lib/                  # Shared Utilities
│   │   ├── prisma.ts         # Prisma Client singleton
│   │   ├── supabase.ts       # Supabase Client
│   │   └── utils.ts          # Tailwind merge & formatting
│   ├── services/             # Core Logic (The Brain)
│   │   ├── ai-orchestrator.ts # Logic for picking agents & tasks
│   │   ├── prompt-builder.ts # Templates for "Personality" injections
│   │   └── llm.ts            # Wrapper for Vercel AI SDK / Claude API
│   └── types/                # TypeScript interfaces
│       └── index.ts          # Shared DB & UI types
├── public/                   # Static assets (logos, icons)
├── .env                      # API Keys and DB URLs
├── context.md                # Project vision & rules
└── structure.md              # THIS FILE