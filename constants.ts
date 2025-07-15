

import { AppDef, Case, CasePriority, CaseStatus, User, CalendarEvent, Workflow } from './types';

export const defaultWorkflow: Workflow = {
  nodes: [
    { id: 'start', type: 'Start', label: 'Case Created', x: 50, y: 150 },
    { 
      id: 'triage', 
      type: 'Task', 
      label: 'Initial Triage', 
      x: 250, 
      y: 150, 
      form: { 
        mode: 'FILL', 
        fields: [
          { id: 'triage-notes', label: 'Triage Notes', type: 'textarea', required: true },
          { id: 'is-critical', label: 'Is Critical?', type: 'checkbox' }
        ]
      }
    },
    { 
      id: 'approval', 
      type: 'Task', 
      label: 'Manager Approval', 
      x: 450, 
      y: 150, 
      form: { 
        mode: 'APPROVAL', 
        fields: [
          { id: 'readonly-triage-notes', label: 'Triage Notes', type: 'readonly-text', sourceFieldId: 'triage-notes' },
          { id: 'readonly-is-critical', label: 'Is Critical?', type: 'readonly-text', sourceFieldId: 'is-critical' },
        ]
      }
    },
    { 
      id: 'investigate', 
      type: 'Task', 
      label: 'Further Investigation', 
      x: 650, 
      y: 50,
      form: { 
        mode: 'FILL', 
        fields: [
            { id: 'investigation-summary', label: 'Investigation Summary', type: 'textarea', required: true }
        ]
      }
    },
    { id: 'rejected', type: 'End', label: 'Close as Rejected', x: 650, y: 250 },
    { id: 'end', type: 'End', label: 'Case Closed', x: 850, y: 50 },
  ],
  edges: [
    { id: 'e-start-triage', source: 'start', target: 'triage' },
    { id: 'e-triage-approval', source: 'triage', target: 'approval' },
    { id: 'e-approval-investigate', source: 'approval', target: 'investigate' },
    { id: 'e-approval-rejected', source: 'approval', target: 'rejected' },
    { id: 'e-investigate-end', source: 'investigate', target: 'end' },
  ],
};


export const INITIAL_APPS: AppDef[] = [
    { id: 'app-1', name: 'Support Desk', icon: '📞', themeColor: 'blue', workflow: JSON.parse(JSON.stringify(defaultWorkflow)) },
    { id: 'app-2', name: 'Dev Projects', icon: '💻', themeColor: 'purple', workflow: JSON.parse(JSON.stringify(defaultWorkflow)) },
    { id: 'app-3', name: 'HR Onboarding', icon: '👥', themeColor: 'green', workflow: JSON.parse(JSON.stringify(defaultWorkflow)) },
];

export const USERS: User[] = [
    { id: 'user-1', name: 'Alina Petrova', email: 'alina.petrova@example.com', role: 'Admin', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
    { id: 'user-2', name: 'Ben Carter', email: 'ben.carter@example.com', role: 'Member', avatarUrl: 'https://picsum.photos/id/1005/100/100' },
    { id: 'user-3', name: 'Chen Lin', email: 'chen.lin@example.com', role: 'Member', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
];

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-1',
    appId: 'app-1',
    title: 'Client Portal Login Failure on Mobile',
    description: 'Users on iOS devices are unable to log in to the client portal. The login button is unresponsive. This issue appears to be specific to Safari on iOS 17 and later. Android devices and desktop browsers are unaffected.',
    status: CaseStatus.New,
    priority: CasePriority.High,
    assignee: USERS[0],
    client: 'Innovate Corp',
    tags: ['bug', 'mobile', 'portal'],
    createdAt: '2024-07-28T10:00:00Z',
    currentWorkflowStepId: 'start',
    workflowHistory: [],
    formData: {},
  },
  {
    id: 'case-2',
    appId: 'app-2',
    title: 'Deploy Staging Environment for Q3 Features',
    description: 'A new staging environment is required to test the upcoming Q3 feature releases. This includes provisioning new servers, configuring the database, and setting up CI/CD pipelines.',
    status: CaseStatus.New,
    priority: CasePriority.Medium,
    assignee: USERS[1],
    client: 'Internal',
    tags: ['devops', 'infrastructure'],
    createdAt: '2024-07-28T11:30:00Z',
    currentWorkflowStepId: 'start',
    workflowHistory: [],
    formData: {},
  },
  {
    id: 'case-3',
    appId: 'app-1',
    title: 'API Rate Limiting Investigation',
    description: 'The primary customer API is experiencing intermittent 429 "Too Many Requests" errors. We need to investigate the source of the traffic spikes and evaluate if the current rate limits are appropriate.',
    status: CaseStatus.InProgress,
    priority: CasePriority.Urgent,
    assignee: USERS[2],
    client: 'Apex Solutions',
    tags: ['api', 'performance', 'investigation'],
    createdAt: '2024-07-27T14:00:00Z',
    currentWorkflowStepId: 'triage',
    workflowHistory: [{ stepId: 'start', userId: 'user-2', completedAt: '2024-07-27T13:00:00Z' }],
    formData: {},
  },
  {
    id: 'case-4',
    appId: 'app-3',
    title: 'Onboard New Marketing Team Member',
    description: 'A new marketing specialist, Jane Doe, is starting next Monday. Prepare their hardware, create necessary accounts (Google Workspace, Slack, etc.), and schedule introductory meetings.',
    status: CaseStatus.InProgress,
    priority: CasePriority.Low,
    assignee: USERS[1],
    client: 'Internal',
    tags: ['onboarding', 'hr'],
    createdAt: '2024-07-26T09:00:00Z',
    currentWorkflowStepId: 'approval',
    workflowHistory: [{ stepId: 'start', userId: 'user-1', completedAt: '2024-07-26T08:00:00Z' }],
    formData: { 'triage-notes': 'New hire setup requested by HR. Standard hardware and software access needed.', 'is-critical': false },
  },
  {
    id: 'case-5',
    appId: 'app-3',
    title: 'Review and Approve Q2 Financial Report',
    description: 'The Q2 financial report has been compiled and is ready for management review. Please verify all figures and provide approval by EOD Friday.',
    status: CaseStatus.Review,
    priority: CasePriority.High,
    assignee: USERS[0],
    client: 'Internal',
    tags: ['finance', 'report', 'review'],
    createdAt: '2024-07-25T16:45:00Z',
    currentWorkflowStepId: 'approval',
    workflowHistory: [{ stepId: 'start', userId: 'user-2', completedAt: '2024-07-25T15:00:00Z' }],
    formData: { 'triage-notes': 'Finance team has submitted the Q2 report for final sign-off.', 'is-critical': true },
  },
  {
    id: 'case-6',
    appId: 'app-2',
    title: 'Update Third-Party SSL Certificate',
    description: 'The SSL certificate for *.api.clientdomain.com is expiring in 14 days. A new certificate has been procured and needs to be deployed across all production load balancers.',
    status: CaseStatus.Closed,
    priority: CasePriority.Medium,
    assignee: USERS[2],
    client: 'Global Tech',
    tags: ['security', 'ssl', 'completed'],
    createdAt: '2024-07-15T12:00:00Z',
    currentWorkflowStepId: 'end',
    workflowHistory: [
      { stepId: 'start', userId: 'user-2', completedAt: '2024-07-15T10:00:00Z' },
      { stepId: 'triage', userId: 'user-2', completedAt: '2024-07-15T11:00:00Z' },
    ],
    formData: { 'triage-notes': 'SSL cert expiring soon. Coordinated with vendor.', 'is-critical': true },
  },
];

const today = new Date();
const setTime = (date: Date, hours: number, minutes: number) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
    {
        id: 'event-1',
        title: 'Team Standup',
        description: 'Daily sync to discuss progress and blockers.',
        start: setTime(today, 9, 0),
        end: setTime(today, 9, 15),
        source: 'local',
    },
    {
        id: 'event-2',
        title: 'Design Review',
        description: 'Review the new dashboard mockups.',
        start: setTime(today, 11, 0),
        end: setTime(today, 12, 0),
        source: 'local',
    },
];

export const MOCK_OUTLOOK_EVENTS: CalendarEvent[] = [
    {
        id: 'outlook-1',
        title: 'Project Phoenix Sync',
        description: 'Weekly check-in on Project Phoenix milestones.',
        start: setTime(today, 14, 0),
        end: setTime(today, 15, 0),
        source: 'outlook',
    },
    {
        id: 'outlook-2',
        title: '1:1 with Manager',
        description: 'Catch-up meeting.',
        start: setTime(today, 16, 30),
        end: setTime(today, 17, 0),
        source: 'outlook',
    }
];