import { KnowledgeItem, Project, Collection, MemoryInsight } from '../types';

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Architect Cost Estimator MVP',
    description: 'A parametric pricing engine that helps architects generate instant project estimates from structural dimensions.',
    status: 'active',
    color: '#7B61FF',
    targetDate: '2026-09-30',
    tags: ['Architecture', 'SaaS', 'Pricing'],
    linkedItemIds: ['item-2', 'item-7'],
    createdAt: '2026-06-12T10:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'proj-2',
    title: 'Personal Knowledge OS (Nuvora)',
    description: 'Connecting capture, understanding, semantic linking, and action into one continuous human workflow.',
    status: 'active',
    color: '#4C9CFF',
    targetDate: '2026-10-15',
    tags: ['AI', 'Productivity', 'Knowledge Graph'],
    linkedItemIds: ['item-5', 'item-6', 'item-8'],
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-08-20T16:00:00Z',
  },
  {
    id: 'proj-3',
    title: 'Renaissance Masterclass Research',
    description: 'Synthesizing historical structural geometry and artistic proportion into an architectural curriculum.',
    status: 'planning',
    color: '#FFB86B',
    targetDate: '2026-12-01',
    tags: ['History', 'Design', 'Curriculum'],
    linkedItemIds: ['item-1', 'item-4'],
    createdAt: '2026-07-04T11:00:00Z',
    updatedAt: '2026-07-15T09:20:00Z',
  },
];

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Architecture & Structural Design',
    description: 'Notes on classical proportions, structural engineering, and modern parametric tools.',
    icon: 'Landmark',
    color: '#7B61FF',
    itemIds: ['item-1', 'item-2'],
    createdAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 'col-2',
    name: 'Distributed Systems & AI Architecture',
    description: 'Consensus protocols, memory hierarchies, agentic grounding, and low-latency APIs.',
    icon: 'Network',
    color: '#4C9CFF',
    itemIds: ['item-3', 'item-6', 'item-8'],
    createdAt: '2026-05-15T12:00:00Z',
  },
  {
    id: 'col-3',
    name: 'Business Strategy & Mental Models',
    description: 'Frameworks for value creation, pricing psychology, and cognitive bias mitigation.',
    icon: 'Compass',
    color: '#FFB86B',
    itemIds: ['item-4', 'item-5'],
    createdAt: '2026-06-01T14:00:00Z',
  },
];

export const SEED_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'item-1',
    type: 'note',
    title: "Brunelleschi's Dome and Renaissance Structural Geometry",
    content: `Filippo Brunelleschi constructed the dome of Santa Maria del Fiore in Florence without wooden centering scaffolding—a feat previously deemed physically impossible.

Key architectural breakthroughs:
1. **Herringbone Brickwork (Spinapesce)**: The bricks were laid in an interlocking herringbone pattern that transferred hoop stress inwards rather than bowing outwards during construction.
2. **Double Shell Construction**: A lightweight outer dome protects against weather while the heavier inner shell bears the primary structural load.
3. **Octagonal Ribbed Geometry**: 8 primary vertical ribs and 16 concealed intermediate ribs create a self-supporting catenary arch.

Connection to modern engineering: Catenary curves and self-locking friction systems remain fundamental to modern lightweight tensile structures.`,
    rawSummary: 'Analysis of Brunelleschi’s double-shell dome in Florence, focusing on the herringbone brickwork (spinapesce) and self-supporting catenary curves that eliminated the need for wooden scaffolding.',
    status: 'processed',
    topics: ['Renaissance Architecture', 'Structural Geometry', 'History of Engineering', 'Physics'],
    entities: ['Filippo Brunelleschi', 'Santa Maria del Fiore', 'Florence', 'Catenary Curve', 'Spinapesce'],
    actionItems: [
      {
        id: 'act-1-1',
        text: 'Review chapter on Italian Renaissance structural arches',
        done: true,
        priority: 'medium',
        originItemId: 'item-1',
        originItemTitle: "Brunelleschi's Dome and Renaissance Structural Geometry",
      },
      {
        id: 'act-1-2',
        text: 'Create 3D diagram of the herringbone brick load vectors',
        done: false,
        priority: 'high',
        originItemId: 'item-1',
        originItemTitle: "Brunelleschi's Dome and Renaissance Structural Geometry",
      },
    ],
    connections: [
      {
        targetId: 'item-2',
        targetTitle: 'Architect Cost Estimator & Parametric Pricing Idea',
        reason: 'Both explore structural calculations—this historical note provides structural rules of thumb that could inform parametric cost algorithms.',
        strength: 0.82,
        type: 'semantic',
      },
    ],
    keyInsights: [
      'Self-supporting brick arches eliminate the immense capital cost of temporary scaffolding.',
      'Double-shell systems solve two distinct physics constraints independently.',
    ],
    category: 'concept',
    collectionId: 'col-1',
    wordCount: 125,
    createdAt: '2026-06-04T14:20:00Z',
    updatedAt: '2026-06-04T15:10:00Z',
    lastAccessedAt: '2026-08-21T18:00:00Z',
  },
  {
    id: 'item-2',
    type: 'idea',
    title: 'Architect Cost Estimator & Parametric Pricing Idea',
    content: `Business Idea: "ArchEstimate" / Parametric Fee Engine for Boutique Architecture Studios.

The core problem: Architects spend 20–40 unpaid hours assembling preliminary construction estimates and fee proposals before securing a client contract.

Solution:
- Input: Building typology, square meters, structural materials (steel, CLT timber, concrete), and site slope.
- Output: Instant parametric cost range broken down by sub-structure, enclosure, MEP, and finishes.
- Includes automated architect fee calculator based on percentage-of-construction or complexity multiplier.

Target market: Independent firms and boutique residential studios (1-10 people).
Monetization: $79/month SaaS tier with proposal PDF generator.`,
    rawSummary: 'SaaS product concept to help boutique architecture firms generate parametric project cost estimates and fee proposals in 5 minutes instead of 30 hours.',
    status: 'processed',
    topics: ['Pricing Models', 'Architecture', 'SaaS', 'Business Strategy'],
    entities: ['ArchEstimate', 'Boutique Studios', 'Parametric Pricing', 'MEP'],
    actionItems: [
      {
        id: 'act-2-1',
        text: 'Interview 3 local architects about their current spreadsheet proposal process',
        done: false,
        priority: 'high',
        suggestedTimeframe: 'immediate',
        projectId: 'proj-1',
        originItemId: 'item-2',
        originItemTitle: 'Architect Cost Estimator & Parametric Pricing Idea',
      },
      {
        id: 'act-2-2',
        text: 'Build simple prototype in Next.js calculating square meter material ranges',
        done: false,
        priority: 'medium',
        suggestedTimeframe: 'this-week',
        projectId: 'proj-1',
        originItemId: 'item-2',
        originItemTitle: 'Architect Cost Estimator & Parametric Pricing Idea',
      },
    ],
    connections: [
      {
        targetId: 'item-1',
        targetTitle: "Brunelleschi's Dome and Renaissance Structural Geometry",
        reason: 'Architectural foundations tie directly to the typology formulas used in ArchEstimate.',
        strength: 0.75,
        type: 'project_opportunity',
      },
      {
        targetId: 'item-5',
        targetTitle: 'Meeting Notes: Q3 Knowledge OS & Pricing Strategy',
        reason: 'Pricing models from both notes share tiered SaaS subscription mechanics.',
        strength: 0.88,
        type: 'semantic',
      },
    ],
    keyInsights: [
      'Preliminary proposal velocity is the primary determinant of agency sales pipeline health.',
      'Parametric multipliers convert complex engineering rules into simple business inputs.',
    ],
    category: 'project_idea',
    projectId: 'proj-1',
    collectionId: 'col-1',
    wordCount: 110,
    createdAt: '2026-06-10T09:15:00Z',
    updatedAt: '2026-08-18T11:40:00Z',
    lastAccessedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'item-3',
    type: 'document',
    title: 'Distributed Consensus: Raft vs Paxos Trade-offs',
    content: `A deep dive into distributed consensus mechanisms for replicated state machines.

1. **Raft (Understandability First)**:
   - Decomposes consensus into leader election, log replication, and safety invariants.
   - Strong leader model: Log entries only flow from leader to followers.
   - Easier to debug and formally prove in production clusters (etcd, Consul).

2. **Multi-Paxos (High Performance)**:
   - Allows symmetric consensus without strict leader bottlenecks in specific variants.
   - Harder to implement correctly due to corner cases in Phase 2b state recovery.

Trade-off takeaway: For personal knowledge systems with local-first replicas, CRDTs (Conflict-free Replicated Data Types) paired with an eventual consistency log often outperform strict quorum consensus for offline-first responsiveness.`,
    rawSummary: 'Comparison of Raft and Multi-Paxos consensus protocols, concluding with the benefits of CRDTs for local-first, offline-capable client applications.',
    status: 'processed',
    topics: ['Distributed Systems', 'System Design', 'Consensus Protocols', 'Database Architecture'],
    entities: ['Raft', 'Paxos', 'CRDT', 'etcd', 'Consul', 'Leslie Lamport'],
    actionItems: [
      {
        id: 'act-3-1',
        text: 'Benchmark CRDT sync latency against WebSockets for multi-device sync',
        done: false,
        priority: 'low',
        originItemId: 'item-3',
        originItemTitle: 'Distributed Consensus: Raft vs Paxos Trade-offs',
      },
    ],
    connections: [
      {
        targetId: 'item-6',
        targetTitle: 'Voice Memo: Grounded Personal Memory & Knowledge Retrieval',
        reason: 'Both address the architecture of low-latency state synchronization in personal tools.',
        strength: 0.78,
        type: 'foundation',
      },
    ],
    keyInsights: [
      'Understandability in system architecture dramatically lowers operational failure rates.',
      'Local-first applications require state synchronization models that embrace temporary partitioning.',
    ],
    category: 'reference',
    collectionId: 'col-2',
    wordCount: 130,
    createdAt: '2026-05-18T16:00:00Z',
    updatedAt: '2026-05-18T17:20:00Z',
    lastAccessedAt: '2026-08-15T10:15:00Z',
  },
  {
    id: 'item-4',
    type: 'note',
    title: 'Cognitive Biases in Product Architecture and Prioritization',
    content: `When building software systems, teams routinely fall victim to three primary cognitive pitfalls:

1. **The Sunk Cost Fallacy in Technical Debt**:
   Continuing to patch a brittle monolithic module simply because 6 months were invested in it, instead of refactoring into clean bounded contexts.

2. **Hyperbolic Discounting**:
   Prioritizing instant gratification (e.g. quick visual flourishes) over enduring foundation (e.g. clean normalized database schemas and offline caching).

3. **Status Quo Bias in Knowledge Organization**:
   Forcing users to organize notes into rigid hierarchical folders (mimicking paper filing cabinets from 1950) instead of associative, semantic graph links.

Remedy: Default to semantic capture first, auto-understanding second, and emergent organization only when useful.`,
    rawSummary: 'Examination of Sunk Cost, Hyperbolic Discounting, and Status Quo Bias in product design, advocating for associative knowledge graphs over rigid folder hierarchies.',
    status: 'processed',
    topics: ['Cognitive Science', 'Mental Models', 'Product Strategy', 'UX Design'],
    entities: ['Sunk Cost Fallacy', 'Hyperbolic Discounting', 'Status Quo Bias', 'Associative Memory'],
    actionItems: [
      {
        id: 'act-4-1',
        text: 'Write brief essay on "Why hierarchical folders fail human memory"',
        done: true,
        priority: 'medium',
        originItemId: 'item-4',
        originItemTitle: 'Cognitive Biases in Product Architecture and Prioritization',
      },
    ],
    connections: [
      {
        targetId: 'item-6',
        targetTitle: 'Voice Memo: Grounded Personal Memory & Knowledge Retrieval',
        reason: 'Associative memory models directly power Nuvora’s semantic graph approach.',
        strength: 0.94,
        type: 'foundation',
      },
    ],
    keyInsights: [
      'Human memory is relational and contextual, not folder-based.',
      'Good tools eliminate organizational tax before capture.',
    ],
    category: 'concept',
    collectionId: 'col-3',
    wordCount: 140,
    createdAt: '2026-06-25T11:30:00Z',
    updatedAt: '2026-07-02T14:15:00Z',
    lastAccessedAt: '2026-08-20T19:00:00Z',
  },
  {
    id: 'item-5',
    type: 'meeting',
    title: 'Meeting Notes: Q3 Knowledge OS Architecture & Core Loop',
    content: `Team sync discussing Nuvora's Q3 technical milestones.

Attendees: Sarah (Design), Marcus (Backend), Alex (AI Lead)

Key Decisions:
- The core loop is **Capture → Understand → Connect → Organize → Create → Act**.
- Gemini 2.5 Flash server-side integration will handle real-time entity and topic extraction within <400ms.
- Avoid cluttered 3D graphs; users want high-signal contextual recommendations and clickable source citations when asking questions.
- Every note must have bi-directional relational capability.

Next Steps:
- Alex: finalize prompt schema for /api/gemini/understand with zero hallucination.
- Sarah: deliver refined Aurora gradient specs and light mode canvas palette.
- Marcus: implement exportable JSON database backup system.`,
    rawSummary: 'Quarterly architecture review establishing Nuvora’s 6-step core loop, Gemini 2.5 Flash server integration, and grounding principles for question answering.',
    status: 'processed',
    topics: ['Product Strategy', 'Knowledge Systems', 'AI Architecture', 'Team Sync'],
    entities: ['Gemini 2.5 Flash', 'Nuvora', 'Aurora Gradient', 'Core Loop'],
    actionItems: [
      {
        id: 'act-5-1',
        text: 'Alex: Finalize prompt schema for /api/gemini/understand',
        done: true,
        priority: 'high',
        suggestedTimeframe: 'immediate',
        projectId: 'proj-2',
        originItemId: 'item-5',
        originItemTitle: 'Meeting Notes: Q3 Knowledge OS Architecture & Core Loop',
      },
      {
        id: 'act-5-2',
        text: 'Sarah: Deliver refined Aurora palette tokens (#7B61FF to #4C9CFF)',
        done: true,
        priority: 'medium',
        suggestedTimeframe: 'this-week',
        projectId: 'proj-2',
        originItemId: 'item-5',
        originItemTitle: 'Meeting Notes: Q3 Knowledge OS Architecture & Core Loop',
      },
      {
        id: 'act-5-3',
        text: 'Marcus: Implement exportable JSON database backup system',
        done: false,
        priority: 'high',
        suggestedTimeframe: 'immediate',
        projectId: 'proj-2',
        originItemId: 'item-5',
        originItemTitle: 'Meeting Notes: Q3 Knowledge OS Architecture & Core Loop',
      },
    ],
    connections: [
      {
        targetId: 'item-6',
        targetTitle: 'Voice Memo: Grounded Personal Memory & Knowledge Retrieval',
        reason: 'Connects strategic product decisions with technical retrieval prototypes.',
        strength: 0.91,
        type: 'semantic',
      },
    ],
    keyInsights: [
      'Actionable outputs matter more to users than passive reading repositories.',
      'Sub-500ms AI understanding prevents capture friction.',
    ],
    category: 'meeting_notes',
    projectId: 'proj-2',
    collectionId: 'col-2',
    wordCount: 155,
    createdAt: '2026-08-01T15:00:00Z',
    updatedAt: '2026-08-01T16:30:00Z',
    lastAccessedAt: '2026-08-22T09:30:00Z',
  },
  {
    id: 'item-6',
    type: 'voice',
    title: 'Voice Memo: Grounded Personal Memory & Contextual Retrieval',
    content: `*Audio Transcription (captured while walking):*
"I was thinking about how traditional search fails us. When I search for 'pricing', I don't just want a list of files that have the word 'pricing' in them. I want Nuvora to remember that 2 months ago I had an idea about architect pricing, and 4 weeks ago I read an article about SaaS value multipliers. The AI should synthesize: 'Here is what you thought, here is what you read, and here is the project you started.' The source citations give total confidence that it's real memory, not an AI hallucination."`,
    rawSummary: 'Voice reflection on replacing keyword search with associative synthesis that bridges past ideas, recent readings, and active projects with verifiable source citations.',
    status: 'processed',
    topics: ['Knowledge Retrieval', 'Cognitive Science', 'AI Memory', 'UX Philosophy'],
    entities: ['Associative Synthesis', 'Verifiable Citations', 'Contextual Retrieval'],
    actionItems: [
      {
        id: 'act-6-1',
        text: 'Draft the "Ask Anything" UI grounded citation block specifications',
        done: true,
        priority: 'high',
        projectId: 'proj-2',
        originItemId: 'item-6',
        originItemTitle: 'Voice Memo: Grounded Personal Memory & Contextual Retrieval',
      },
    ],
    connections: [
      {
        targetId: 'item-2',
        targetTitle: 'Architect Cost Estimator & Parametric Pricing Idea',
        reason: 'The voice note specifically references the pricing idea captured earlier as a prime example of memory synthesis.',
        strength: 0.96,
        type: 'semantic',
      },
      {
        targetId: 'item-4',
        targetTitle: 'Cognitive Biases in Product Architecture and Prioritization',
        reason: 'Echoes the premise that associative networks align with cognitive human memory.',
        strength: 0.89,
        type: 'foundation',
      },
    ],
    keyInsights: [
      'Search should answer queries by connecting the user’s history, not by listing isolated keywords.',
      'Citations convert speculative AI into trustworthy memory.',
    ],
    category: 'reflection',
    projectId: 'proj-2',
    collectionId: 'col-2',
    wordCount: 95,
    createdAt: '2026-08-10T08:45:00Z',
    updatedAt: '2026-08-10T09:00:00Z',
    lastAccessedAt: '2026-08-22T10:10:00Z',
  },
  {
    id: 'item-7',
    type: 'web',
    title: 'Benchmark: Standard Construction Cost per Square Meter in 2026',
    content: `Reference data from the National Building Institute:
- Residential Type A (High Spec Timber Frame): $2,800 - $3,400 / sq meter.
- Commercial Hybrid CLT (Cross-Laminated Timber): $3,100 - $4,200 / sq meter.
- Industrial Steel Portal Frame: $1,200 - $1,700 / sq meter.

Key cost inflation factors:
- Mechanical & Electrical (MEP): now represents 28% of total building budget due to smart grid and heat pump mandates.
- Foundation engineering on sloped terrain adds 15–35% to ground floor substructure.`,
    rawSummary: 'Benchmark construction cost metrics per square meter across residential, commercial CLT, and industrial structures with MEP cost breakdowns.',
    sourceUrl: 'https://nationalbuildinginstitute.org/reports/2026-metrics',
    status: 'processed',
    topics: ['Architecture', 'Construction Metrics', 'Pricing Models', 'Real Estate'],
    entities: ['Cross-Laminated Timber', 'MEP', 'National Building Institute', 'Substructure'],
    actionItems: [
      {
        id: 'act-7-1',
        text: 'Incorporate 2026 CLT cost ranges into ArchEstimate baseline dataset',
        done: false,
        priority: 'medium',
        suggestedTimeframe: 'this-week',
        projectId: 'proj-1',
        originItemId: 'item-7',
        originItemTitle: 'Benchmark: Standard Construction Cost per Square Meter in 2026',
      },
    ],
    connections: [
      {
        targetId: 'item-2',
        targetTitle: 'Architect Cost Estimator & Parametric Pricing Idea',
        reason: 'Provides the exact empirical pricing figures required by the ArchEstimate engine.',
        strength: 0.95,
        type: 'foundation',
      },
    ],
    keyInsights: [
      'MEP has risen to 28% of total construction budgets.',
      'Parametric tools must account for slope multipliers in foundation formulas.',
    ],
    category: 'reference',
    projectId: 'proj-1',
    collectionId: 'col-1',
    wordCount: 90,
    createdAt: '2026-08-14T13:10:00Z',
    updatedAt: '2026-08-14T13:20:00Z',
    lastAccessedAt: '2026-08-21T15:00:00Z',
  },
  {
    id: 'item-8',
    type: 'idea',
    title: 'Ambient Knowledge Pulse & Proactive Memory Sparks',
    content: `How to keep a knowledge system alive without annoying push notifications:
1. **The Ambient Pulse**: When the user opens Nuvora, display a subtle 1-line recap: "You have 8 connected ideas across 3 active outcomes."
2. **Forgotten Spark Algorithm**: If a high-value note hasn't been accessed in >30 days, surface it softly: "You captured an idea about Parametric Pricing 2 months ago. Would you like to connect it to an active project?"
3. **Emergent Task Synthesis**: When 3 related notes accumulate action items, suggest bundling them into a unified project.`,
    rawSummary: 'Proactive memory mechanism that gently resurfaces forgotten ideas and auto-suggests bundling related notes into actionable projects.',
    status: 'inbox',
    topics: ['AI Memory', 'UX Design', 'Product Strategy', 'Proactive Intelligence'],
    entities: ['Ambient Pulse', 'Forgotten Spark Algorithm', 'Emergent Synthesis'],
    actionItems: [
      {
        id: 'act-8-1',
        text: 'Build Forgotten Idea card component in the Home view',
        done: true,
        priority: 'high',
        projectId: 'proj-2',
        originItemId: 'item-8',
        originItemTitle: 'Ambient Knowledge Pulse & Proactive Memory Sparks',
      },
    ],
    connections: [
      {
        targetId: 'item-6',
        targetTitle: 'Voice Memo: Grounded Personal Memory & Contextual Retrieval',
        reason: 'Implements the proactive resurfacing concept mentioned in the voice memo.',
        strength: 0.91,
        type: 'semantic',
      },
    ],
    keyInsights: [
      'Proactive intelligence must feel like a calm thought rather than a noisy notification.',
      'Value compounds when historical knowledge bridges into present action.',
    ],
    category: 'project_idea',
    projectId: 'proj-2',
    collectionId: 'col-2',
    wordCount: 115,
    createdAt: '2026-08-22T07:15:00Z',
    updatedAt: '2026-08-22T07:15:00Z',
    lastAccessedAt: '2026-08-22T09:00:00Z',
  },
];

export const SEED_MEMORY_INSIGHTS: MemoryInsight[] = [
  {
    id: 'ins-1',
    type: 'forgotten_idea',
    title: 'Forgotten Concept: Architect Cost Estimator',
    description: 'You captured the "ArchEstimate" idea on June 10th and added benchmark data on August 14th. You have 2 uncompleted interview tasks.',
    relatedItemIds: ['item-2', 'item-7'],
    date: '2026-08-22T08:00:00Z',
  },
  {
    id: 'ins-2',
    type: 'connection_discovered',
    title: 'Cross-Domain Link: Structural Geometry & Modern Parametric Math',
    description: 'Brunelleschi’s catenary curves in Renaissance architecture share mathematical foundations with modern CLT building estimation.',
    relatedItemIds: ['item-1', 'item-2'],
    date: '2026-08-21T14:00:00Z',
  },
  {
    id: 'ins-3',
    type: 'repeated_thought',
    title: 'Recurring Theme: Associative Memory vs Hierarchical Folders',
    description: 'You’ve explored associative memory in 3 separate notes across Cognitive Biases, Voice Memo, and Ambient Knowledge Pulse.',
    relatedItemIds: ['item-4', 'item-6', 'item-8'],
    date: '2026-08-22T09:15:00Z',
  },
];
