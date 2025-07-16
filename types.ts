import React from 'react';

// New Type for App Definition
export interface AppDef {
  id: string;
  name:string;
  icon: string; // emoji or char
  themeColor: string; // e.g. blue, purple, green
  workflow: Workflow;
}

export enum CaseStatus {
  New = 'New',
  InProgress = 'In Progress',
  Review = 'In Review',
  Closed = 'Closed',
}

export enum CasePriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
}

export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: UserRole;
}

export interface Case {
  id: string;
  appId: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignee: User;
  client: string;
  tags: string[];
  createdAt: string;
  currentWorkflowStepId: string | null;
  workflowHistory: WorkflowEvent[];
  formData: Record<string, any>;
}

export interface WorkflowEvent {
    stepId: string;
    userId: string;
    completedAt: string;
}

export interface Connector {
    id:string;
    name: string;
    icon: React.ReactNode;
    description: string;
    enabled: boolean;
}

export type ActiveView = 'Boards' | 'Cases' | 'Reports' | 'Settings';

// New types for the Workflow Builder
export type BuilderNodeType = 'Task' | 'Gateway' | 'Timer' | 'Message' | 'Start' | 'End';

export type FormFieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'readonly-text';

export type NodeFormMode = 'FILL' | 'APPROVAL';

export interface FormField {
  id: string; // Must be unique within a workflow
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[]; // for select
  sourceFieldId?: string; // for readonly-text, points to another field's id
}

export interface NodeForm {
  mode: NodeFormMode;
  fields: FormField[];
}

export interface BuilderNode {
  id: string;
  type: BuilderNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  assigneeId?: string;
  form?: NodeForm;
}

export interface BuilderEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export interface Workflow {
    nodes: BuilderNode[];
    edges: BuilderEdge[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  source: 'local' | 'outlook';
}