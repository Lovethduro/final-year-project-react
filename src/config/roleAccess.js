export const SYSTEM_ROLES = [
    {
        id: 'ADMIN',
        label: 'Administrator',
        description: 'Full control of users, system settings, security, and all CRM modules.',
    },
    {
        id: 'SUPERVISOR',
        label: 'Supervisor',
        description: 'Oversees teams, analytics, approvals, and cross-department operations.',
    },
    {
        id: 'SALES_AGENT',
        label: 'Sales Agent',
        description: 'Manages leads, sales pipeline, and customer conversations.',
    },
    {
        id: 'SUPPORT_AGENT',
        label: 'Support Agent',
        description: 'Handles support tickets, customer issues, and the knowledge base.',
    },
    {
        id: 'CUSTOMER',
        label: 'Customer',
        description: 'Self-service portal for products, tickets, billing, and support.',
    },
];

export const ROLE_ACCESS = {
    ADMIN: {
        highlights: ['Assign roles in User Management', 'System configuration & security audit', 'Full CRM and admin modules'],
        areas: [
            { module: 'User Management', access: 'Create users, assign roles, activate/deactivate accounts' },
            { module: 'Sales & Leads', access: 'Full access' },
            { module: 'Customers & Tickets', access: 'View all tickets; internal notes by default; reply only on takeover or SLA escalation' },
            { module: 'Sales Conversations', access: 'Read-only monitor of customer ↔ sales agent chats' },
            { module: 'Analytics & Performance', access: 'View all insights and team metrics' },
            { module: 'Broadcast & Approvals', access: 'Send announcements and manage approvals' },
            { module: 'Products & Hot Deals', access: 'Manage catalog and promotions' },
            { module: 'Knowledge Base', access: 'Create and edit articles' },
            { module: 'System Config', access: 'Configure platform settings' },
            { module: 'Security & Compliance', access: 'Audit logs, compliance reports, data management' },
            { module: 'Billing & Staff Store', access: 'View billing and staff purchasing' },
        ],
    },
    SUPERVISOR: {
        highlights: ['Team oversight and escalations', 'Analytics and performance dashboards', 'Broadcast messages to staff'],
        areas: [
            { module: 'User Management', access: 'View users and account status' },
            { module: 'Sales & Leads', access: 'Full access' },
            { module: 'Customers & Tickets', access: 'Full access including escalated chats' },
            { module: 'Analytics & Performance', access: 'View team insights and CSAT' },
            { module: 'Broadcast & Approvals', access: 'Send announcements and review approvals' },
            { module: 'Hot Deals', access: 'Manage promotions' },
            { module: 'Knowledge Base', access: 'Create and edit articles' },
            { module: 'System Health', access: 'View service status' },
            { module: 'Calendar & Leave', access: 'Team scheduling and leave requests' },
        ],
    },
    SALES_AGENT: {
        highlights: ['Lead and pipeline management', 'Customer messaging', 'Sales playbook'],
        areas: [
            { module: 'Sales & Leads', access: 'Manage assigned leads and opportunities' },
            { module: 'Customers', access: 'View customer records' },
            { module: 'Customer Messages', access: 'Chat with customers' },
            { module: 'Sales Playbook', access: 'View sales guidance' },
            { module: 'Sales Insights', access: 'Personal pipeline, team rank, and performance highlights' },
            { module: 'Calendar & Leave', access: 'Personal schedule and leave' },
            { module: 'Staff Store & Billing', access: 'Staff purchasing and billing views' },
        ],
    },
    SUPPORT_AGENT: {
        highlights: ['Ticket queue and replies', 'Knowledge base maintenance', 'Customer support'],
        areas: [
            { module: 'Tickets & Chat', access: 'Handle and resolve support tickets' },
            { module: 'Customers', access: 'View customer records' },
            { module: 'Knowledge Base', access: 'Create and edit help articles' },
            { module: 'Calendar & Leave', access: 'Personal schedule and leave' },
            { module: 'Staff Store & Billing', access: 'Staff purchasing and billing views' },
        ],
    },
    CUSTOMER: {
        highlights: ['Self-service support', 'Product catalog and hot deals', 'Own tickets and billing'],
        areas: [
            { module: 'My Tickets', access: 'Create and track support requests' },
            { module: 'Contact Support', access: 'Reach the support team' },
            { module: 'Message Sales', access: 'Chat with sales' },
            { module: 'Products & Hot Deals', access: 'Browse and purchase' },
            { module: 'Help Center', access: 'Read knowledge base articles' },
            { module: 'Billing', access: 'View invoices and payment history' },
            { module: 'Profile', access: 'Manage account details and MFA' },
        ],
    },
};

export const ROLE_API_VALUES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    SALES_AGENT: 'sales_agent',
    SUPPORT_AGENT: 'support_agent',
    CUSTOMER: 'customer',
};
