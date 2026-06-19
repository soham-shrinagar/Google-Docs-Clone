export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  title: string;
  html: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start from scratch',
    category: 'General',
    thumbnail: 'linear-gradient(135deg,#f3f4f6,#e5e7eb)',
    title: 'Untitled Document',
    html: '<p></p>',
  },
  {
    id: 'resume',
    name: 'Resume',
    description: 'Professional CV layout',
    category: 'Career',
    thumbnail: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
    title: 'My Resume',
    html: `<h1 style="text-align:center">Your Name</h1>
<p style="text-align:center"><strong>Software Engineer</strong> · your@email.com · (555) 123-4567 · City, Country</p>
<hr/>
<h2>Summary</h2>
<p>Results-driven engineer with experience building scalable web applications and distributed systems.</p>
<h2>Experience</h2>
<h3>Company Name — Role</h3>
<p><em>Jan 2022 – Present</em></p>
<ul><li>Led development of a real-time collaboration platform serving 10K+ users</li><li>Reduced API latency by 40% through caching and query optimization</li></ul>
<h2>Education</h2>
<p><strong>University Name</strong> — B.S. Computer Science</p>
<h2>Skills</h2>
<p>TypeScript, React, Node.js, PostgreSQL, AWS, System Design</p>`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Agenda, notes & action items',
    category: 'Work',
    thumbnail: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    title: 'Meeting Notes',
    html: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> ___________ &nbsp; <strong>Attendees:</strong> ___________</p>
<h2>Agenda</h2>
<ol><li>Project status update</li><li>Blockers & risks</li><li>Next steps</li></ol>
<h2>Discussion</h2>
<p></p>
<h2>Action Items</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false">Action item 1 — Owner: ___</li><li data-type="taskItem" data-checked="false">Action item 2 — Owner: ___</li></ul>
<h2>Next Meeting</h2>
<p>Date: ___________</p>`,
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Pitch a new initiative',
    category: 'Work',
    thumbnail: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    title: 'Project Proposal',
    html: `<h1>Project Proposal: [Project Name]</h1>
<p><strong>Author:</strong> ___ &nbsp; <strong>Date:</strong> ___</p>
<h2>Problem Statement</h2>
<p>Describe the problem this project solves.</p>
<h2>Proposed Solution</h2>
<p>Outline your approach and key features.</p>
<h2>Timeline</h2>
<table><tr><th>Phase</th><th>Duration</th><th>Deliverables</th></tr><tr><td>Phase 1</td><td>2 weeks</td><td>MVP</td></tr><tr><td>Phase 2</td><td>4 weeks</td><td>Full launch</td></tr></table>
<h2>Budget & Resources</h2>
<p></p>
<h2>Success Metrics</h2>
<ul><li>Metric 1</li><li>Metric 2</li></ul>`,
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Article with intro & sections',
    category: 'Content',
    thumbnail: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    title: 'Blog Post Title',
    html: `<h1>Your Blog Post Title</h1>
<p><em>By Author Name · 5 min read</em></p>
<blockquote><p>A compelling hook that draws readers in and sets the tone for the article.</p></blockquote>
<h2>Introduction</h2>
<p>Start with context and why this topic matters.</p>
<h2>Main Section</h2>
<p>Develop your key argument with examples and data.</p>
<h2>Conclusion</h2>
<p>Summarize takeaways and include a call to action.</p>`,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email-style update layout',
    category: 'Marketing',
    thumbnail: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
    title: 'Newsletter — Issue #1',
    html: `<h1 style="text-align:center">📬 Newsletter</h1>
<p style="text-align:center"><em>Issue #1 · Month Year</em></p>
<hr/>
<h2>👋 Hello!</h2>
<p>Welcome to this week's update. Here's what's new.</p>
<h2>🔥 Highlights</h2>
<ul><li>Highlight one</li><li>Highlight two</li><li>Highlight three</li></ul>
<h2>📖 Featured Story</h2>
<p>Share your main content piece here.</p>
<h2>🔗 Quick Links</h2>
<ul><li><a href="#">Link 1</a></li><li><a href="#">Link 2</a></li></ul>
<p style="text-align:center"><em>Thanks for reading!</em></p>`,
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Bill clients professionally',
    category: 'Business',
    thumbnail: 'linear-gradient(135deg,#ffedd5,#fed7aa)',
    title: 'Invoice #001',
    html: `<h1>INVOICE</h1>
<p><strong>From:</strong> Your Company<br/><strong>To:</strong> Client Name<br/><strong>Invoice #:</strong> 001 &nbsp; <strong>Date:</strong> ___ &nbsp; <strong>Due:</strong> ___</p>
<table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td>Service / Product</td><td>1</td><td>$0.00</td><td>$0.00</td></tr><tr><td>Service / Product</td><td>1</td><td>$0.00</td><td>$0.00</td></tr></table>
<p style="text-align:right"><strong>Total: $0.00</strong></p>
<h3>Payment Details</h3>
<p>Bank: ___ · Account: ___ · Notes: ___</p>`,
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Slide-style document outline',
    category: 'General',
    thumbnail: 'linear-gradient(135deg,#ccfbf1,#99f6e4)',
    title: 'Presentation',
    html: `<h1 style="text-align:center">Presentation Title</h1>
<p style="text-align:center"><em>Subtitle or presenter name</em></p>
<hr/>
<h1>Slide 1 — Introduction</h1>
<ul><li>Key point one</li><li>Key point two</li><li>Key point three</li></ul>
<hr/>
<h1>Slide 2 — The Problem</h1>
<p>Describe the challenge or opportunity.</p>
<hr/>
<h1>Slide 3 — Our Solution</h1>
<p>Explain your approach.</p>
<hr/>
<h1>Slide 4 — Thank You</h1>
<p style="text-align:center"><strong>Questions?</strong></p>`,
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Board',
    description: 'Capture ideas freely',
    category: 'Creative',
    thumbnail: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)',
    title: 'Brainstorm Session',
    html: `<h1>💡 Brainstorm Session</h1>
<p><strong>Topic:</strong> ___ &nbsp; <strong>Date:</strong> ___</p>
<h2>🟢 Ideas</h2>
<ul><li>Idea 1</li><li>Idea 2</li><li>Idea 3</li></ul>
<h2>🟡 Maybe Later</h2>
<ul><li></li></ul>
<h2>🔴 Not Now</h2>
<ul><li></li></ul>
<h2>✅ Selected for Action</h2>
<ul><li></li></ul>`,
  },
];

export function getTemplate(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}
