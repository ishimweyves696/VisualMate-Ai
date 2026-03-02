import { VisualData } from '../types';

export const PUBLIC_SAMPLES: VisualData[] = [
  {
    id: 'public-sample-1',
    topic: 'SaaS Multi-Tenant Architecture',
    title: 'Multi-Tenant Cloud Architecture',
    description: 'A comprehensive view of a multi-tenant SaaS architecture using database-per-tenant isolation and shared application tier.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709280000000,
    imageUrl: 'https://picsum.photos/seed/saas-arch/1280/720',
    category: 'Architecture',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'Load Balancer', type: 'input', description: 'Distributes incoming traffic across multiple app servers.' },
      { id: 'n2', label: 'App Tier', type: 'process', description: 'Shared application logic handling multi-tenant requests.' },
      { id: 'n3', label: 'Tenant Resolver', type: 'process', description: 'Identifies tenant ID from request context/subdomain.' },
      { id: 'n4', label: 'Isolated DBs', type: 'output', description: 'Separate database instances for each tenant to ensure data privacy.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Routes' },
      { from: 'n2', to: 'n3', label: 'Identifies' },
      { from: 'n3', to: 'n4', label: 'Connects' }
    ],
    imagePrompt: 'A professional technical diagram of multi-tenant SaaS architecture, clean lines, blue and white theme, isometric style.',
    commentary: 'This visual illustrates the isolation strategy for high-security SaaS environments.'
  },
  {
    id: 'public-sample-2',
    topic: 'Real-time Data Pipeline',
    title: 'Event-Driven Data Pipeline',
    description: 'A high-throughput data pipeline for processing real-time events using Kafka and stream processing.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709281000000,
    imageUrl: 'https://picsum.photos/seed/data-pipeline/1280/720',
    category: 'Data Engineering',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'Event Source', type: 'input', description: 'Mobile apps and web clients generating user events.' },
      { id: 'n2', label: 'Kafka Cluster', type: 'process', description: 'Distributed message broker for event ingestion.' },
      { id: 'n3', label: 'Stream Processor', type: 'process', description: 'Real-time transformation and enrichment of event data.' },
      { id: 'n4', label: 'Data Lake', type: 'output', description: 'Persistent storage for raw and processed events.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Publishes' },
      { from: 'n2', to: 'n3', label: 'Consumes' },
      { from: 'n3', to: 'n4', label: 'Persists' }
    ],
    imagePrompt: 'A technical flow diagram of a data pipeline, glowing lines, dark mode aesthetic, professional design.',
    commentary: 'A robust architecture for handling millions of events per second with low latency.'
  },
  {
    id: 'public-sample-3',
    topic: 'Microservices Communication',
    title: 'Service Mesh Communication',
    description: 'Visualizing service-to-service communication within a Kubernetes cluster using a sidecar proxy pattern.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709282000000,
    imageUrl: 'https://picsum.photos/seed/microservices/1280/720',
    category: 'DevOps',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'Service A', type: 'process', description: 'Core business logic service.' },
      { id: 'n2', label: 'Sidecar Proxy', type: 'process', description: 'Handles mTLS, retries, and observability.' },
      { id: 'n3', label: 'Service B', type: 'process', description: 'Downstream dependency service.' },
      { id: 'n4', label: 'Control Plane', type: 'concept', description: 'Manages configuration and policy for proxies.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Intercepts' },
      { from: 'n2', to: 'n3', label: 'Proxies' },
      { from: 'n4', to: 'n2', label: 'Configures' }
    ],
    imagePrompt: 'A clean diagram of microservices and sidecar proxies, networking style, professional icons.',
    commentary: 'Illustrates how service meshes decouple networking logic from application code.'
  },
  {
    id: 'public-sample-4',
    topic: 'User Authentication Flow',
    title: 'OAuth2 / OIDC Auth Flow',
    description: 'The standard authorization code flow with PKCE for secure user authentication in modern apps.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709283000000,
    imageUrl: 'https://picsum.photos/seed/auth-flow/1280/720',
    category: 'Security',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'User Agent', type: 'input', description: 'Browser or mobile app initiating login.' },
      { id: 'n2', label: 'Auth Server', type: 'process', description: 'Identity provider (e.g., Auth0, Firebase).' },
      { id: 'n3', label: 'App Backend', type: 'process', description: 'Exchanges code for tokens.' },
      { id: 'n4', label: 'Protected API', type: 'output', description: 'Resource server requiring valid JWT.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Redirects' },
      { from: 'n2', to: 'n3', label: 'Returns Code' },
      { from: 'n3', to: 'n4', label: 'Calls with JWT' }
    ],
    imagePrompt: 'A security sequence diagram of OAuth2 flow, professional, clean, high contrast.',
    commentary: 'The industry-standard approach for secure, delegated authorization.'
  },
  {
    id: 'public-sample-5',
    topic: 'Serverless Event-Driven System',
    title: 'Serverless Image Processing',
    description: 'An event-driven architecture for processing uploaded images using cloud functions and storage triggers.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709284000000,
    imageUrl: 'https://picsum.photos/seed/serverless/1280/720',
    category: 'Cloud Native',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'S3 Bucket', type: 'input', description: 'Storage for raw image uploads.' },
      { id: 'n2', label: 'Lambda Trigger', type: 'event', description: 'Event fired on new object creation.' },
      { id: 'n3', label: 'Image Processor', type: 'process', description: 'Resizes and optimizes images.' },
      { id: 'n4', label: 'CDN / Cache', type: 'output', description: 'Serves processed images to users.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Triggers' },
      { from: 'n2', to: 'n3', label: 'Invokes' },
      { from: 'n3', to: 'n4', label: 'Uploads' }
    ],
    imagePrompt: 'A cloud architecture diagram of serverless functions, AWS style icons, professional layout.',
    commentary: 'Demonstrates the power of event-driven scaling in modern cloud environments.'
  },
  {
    id: 'public-sample-6',
    topic: 'API Gateway Strategy',
    title: 'API Gateway & Rate Limiting',
    description: 'Managing API traffic, security, and rate limiting at the edge of the network.',
    subject: 'General',
    gradeLevel: 'University',
    language: 'English',
    style: 'Diagram',
    createdAt: 1709285000000,
    imageUrl: 'https://picsum.photos/seed/api-gateway/1280/720',
    category: 'Infrastructure',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'Public Internet', type: 'input', description: 'Incoming client requests.' },
      { id: 'n2', label: 'API Gateway', type: 'process', description: 'Entry point with rate limiting and auth.' },
      { id: 'n3', label: 'Redis Cache', type: 'process', description: 'Stores rate limit counters and session data.' },
      { id: 'n4', label: 'Upstream Services', type: 'output', description: 'Internal microservices handling requests.' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Requests' },
      { from: 'n2', to: 'n3', label: 'Checks Quota' },
      { from: 'n2', to: 'n4', label: 'Forwards' }
    ],
    imagePrompt: 'A technical diagram of an API gateway, networking lines, professional aesthetic.',
    commentary: 'Essential for protecting backend services from abuse and traffic spikes.'
  }
];
