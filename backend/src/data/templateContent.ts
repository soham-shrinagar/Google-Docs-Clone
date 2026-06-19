/** TipTap JSON document content for reliable template seeding */
export type TemplateBlock = Record<string, unknown>;

export function getTemplateContent(templateId: string): { type: 'doc'; content: TemplateBlock[] } | null {
  return TEMPLATE_CONTENT[templateId] ?? null;
}

const TEMPLATE_CONTENT: Record<string, { type: 'doc'; content: TemplateBlock[] }> = {
  resume: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1, textAlign: 'center' }, content: [{ type: 'text', text: 'Your Full Name' }] },
      { type: 'paragraph', attrs: { textAlign: 'center' }, content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Software Engineer' },
        { type: 'text', text: '  ·  your.email@example.com  ·  (555) 123-4567  ·  San Francisco, CA' },
      ]},
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Professional Summary' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Results-driven engineer with 5+ years building scalable web applications, distributed systems, and real-time collaboration tools. Passionate about clean code and user experience.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Experience' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Senior Software Engineer — Tech Company Inc.' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Jan 2022 – Present  ·  Remote' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Led real-time collaboration platform serving 10,000+ daily active users' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reduced API latency by 40% through caching and database optimization' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mentored 3 junior engineers and established code review standards' }] }] },
      ]},
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Software Engineer — Startup Labs' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Jun 2019 – Dec 2021' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Built React/Node.js products from zero to 50K users' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Education' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'B.S. Computer Science' }, { type: 'text', text: ' — University Name, 2019' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Skills' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'TypeScript · React · Node.js · PostgreSQL · AWS · System Design · CRDTs · WebSockets' }] },
    ],
  },
  'meeting-notes': {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '📋 Meeting Notes' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: '_______________    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Attendees: ' }, { type: 'text', text: '_______________' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
      { type: 'orderedList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Project status update' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Blockers & risks discussion' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Next steps & action items' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Discussion Notes' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Key points discussed during the meeting...' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important decision: ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Add your key decisions here' }] }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✅ Action Items' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[ ] Task 1 — Owner: ___ — Due: ___' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[ ] Task 2 — Owner: ___ — Due: ___' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[ ] Task 3 — Owner: ___ — Due: ___' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Next Meeting' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Date: _______________  ·  Time: _______________' }] },
    ],
  },
  'project-proposal': {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Proposal' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Project: ' }, { type: 'text', text: '[Project Name]    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Author: ' }, { type: 'text', text: '[Your Name]    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: '[Date]' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Problem Statement' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Describe the problem this project solves and why it matters to the business or users.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Proposed Solution' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Outline your approach, key features, and technical architecture.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Timeline & Milestones' }] },
      { type: 'table', content: [
        { type: 'tableRow', content: [
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Duration' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Deliverables' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 1 — Discovery' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '2 weeks' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Requirements doc, wireframes' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 2 — Build' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '6 weeks' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'MVP launch' }] }] },
        ]},
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Success Metrics' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Metric 1: e.g. 20% increase in user engagement' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Metric 2: e.g. Reduce processing time by 50%' }] }] },
      ]},
    ],
  },
  'blog-post': {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Your Blog Post Title Goes Here' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'By [Author Name]  ·  5 min read  ·  [Category]' }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A compelling opening hook that draws readers in and sets the tone for your article.' }] }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Start with context — why this topic matters and what the reader will learn.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Main Section' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Develop your key argument with examples, data, and personal insights.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Subsection' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Dive deeper into a specific aspect of your topic.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Summarize key takeaways and include a call to action for your readers.' }] },
    ],
  },
  newsletter: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1, textAlign: 'center' }, content: [{ type: 'text', text: '📬 Weekly Newsletter' }] },
      { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Issue #1  ·  [Month Year]' }] },
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '👋 Hello!' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to this week\'s update! Here\'s what\'s new and noteworthy.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🔥 This Week\'s Highlights' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Highlight one — describe your first key update' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Highlight two — share news or achievements' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Highlight three — upcoming events or launches' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📖 Featured Story' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Write your main content piece here — a deep dive, interview, or announcement.' }] },
      { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Thanks for reading! Forward to a friend →' }] },
    ],
  },
  invoice: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'INVOICE' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'From: ' }, { type: 'text', text: 'Your Company Name\n123 Business St, City\nyour@company.com' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Bill To: ' }, { type: 'text', text: 'Client Name\nClient Address' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Invoice #: ' }, { type: 'text', text: '001    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: '[Date]    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Due: ' }, { type: 'text', text: '[Due Date]' }] },
      { type: 'table', content: [
        { type: 'tableRow', content: [
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Description' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Qty' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rate' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Amount' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Web Development Services' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '40 hrs' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$75.00' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$3,000.00' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'UI/UX Design' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10 hrs' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$90.00' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$900.00' }] }] },
        ]},
      ]},
      { type: 'paragraph', attrs: { textAlign: 'right' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Total: $3,900.00' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Payment Details' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Bank: [Bank Name]  ·  Account: [Number]  ·  Notes: Payment due within 30 days.' }] },
    ],
  },
  presentation: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1, textAlign: 'center' }, content: [{ type: 'text', text: 'Presentation Title' }] },
      { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Subtitle or tagline  ·  Presenter Name' }] },
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Slide 1 — Introduction' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Who we are and what we do' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Why this matters today' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'What you\'ll learn in this presentation' }] }] },
      ]},
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Slide 2 — The Problem' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Describe the challenge or opportunity your audience faces.' }] },
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Slide 3 — Our Solution' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Explain your approach and key differentiators.' }] },
      { type: 'horizontalRule' },
      { type: 'heading', attrs: { level: 1, textAlign: 'center' }, content: [{ type: 'text', text: 'Thank You — Questions?' }] },
    ],
  },
  brainstorm: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '💡 Brainstorm Session' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Topic: ' }, { type: 'text', text: '_______________    ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: '_______________' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🟢 Ideas — Go wild!' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Idea 1 — describe your first concept' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Idea 2 — build on or contrast with idea 1' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Idea 3 — think outside the box' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🟡 Maybe Later' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Park ideas here for future consideration' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✅ Selected for Action' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Top pick — next steps: ___' }] }] },
      ]},
    ],
  },
};
