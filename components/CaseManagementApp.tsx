

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppDef, Case, CaseStatus, ActiveView, Workflow, WorkflowEvent, BuilderNode } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import KanbanBoard from './KanbanBoard';
import Modal from './Modal';
import NewCaseForm from './NewCaseForm';
import CaseDetailView from './CaseDetailView';
import CaseListView from './CaseListView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import { useAuth } from '../contexts/AuthContext';


interface CaseManagementAppProps {
    app: AppDef;
    allCases: Case[];
    onExit: () => void;
    onUpdateApp: (updatedApp: AppDef) => void;
    onAddCase: (caseToAdd: Case) => void;
    onUpdateCase: (updatedCase: Case) => void;
    caseToOpenId?: string | null;
}

export default function CaseManagementApp({ app, allCases, onExit, onUpdateApp, onAddCase, onUpdateCase, caseToOpenId }: CaseManagementAppProps) {
  const { currentUser, users } = useAuth();
  const [currentApp, setCurrentApp] = useState<AppDef>(app);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isCreatingNewCase, setIsCreatingNewCase] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('Boards');
  
  const appCases = useMemo(() => allCases.filter(c => c.appId === app.id), [allCases, app.id]);

  useEffect(() => {
    setCurrentApp(app);
  }, [app]);
  
  const handleOpenNewCaseModal = useCallback(() => {
    setSelectedCase(null);
    setIsCreatingNewCase(true);
    setIsModalOpen(true);
  }, []);
  
  const handleOpenCaseDetails = useCallback((caseData: Case) => {
    setSelectedCase(caseData);
    setIsCreatingNewCase(false);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
      if (caseToOpenId) {
          const caseToOpen = appCases.find(c => c.id === caseToOpenId);
          if (caseToOpen) {
              handleOpenCaseDetails(caseToOpen);
          }
      }
  }, [caseToOpenId, appCases, handleOpenCaseDetails]);

  const kanbanColumns = useMemo((): BuilderNode[] => {
    if (!currentApp.workflow?.nodes) return [];
    return currentApp.workflow.nodes
        .filter(node => node.type === 'Start' || node.type === 'Task' || node.type === 'End')
        .sort((a, b) => a.x - b.x); // Sort columns by their horizontal position in the builder
  }, [currentApp.workflow]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
        setSelectedCase(null);
        setIsCreatingNewCase(false);
    }, 300);
  }, []);

  const handleAddCaseLocal = useCallback((newCaseData: Omit<Case, 'id' | 'appId' | 'createdAt' | 'status' | 'currentWorkflowStepId' | 'workflowHistory' | 'formData'>) => {
    const startNode = currentApp.workflow.nodes.find(n => n.type === 'Start');
    const caseToAdd: Case = {
        ...newCaseData,
        id: `case-${Date.now()}`,
        appId: app.id,
        createdAt: new Date().toISOString(),
        status: CaseStatus.New,
        currentWorkflowStepId: startNode ? startNode.id : null,
        workflowHistory: [],
        formData: {},
    };
    onAddCase(caseToAdd);
    handleCloseModal();
  }, [handleCloseModal, currentApp.workflow.nodes, app.id, onAddCase]);
  
  const handleWorkflowChange = useCallback((newWorkflow: Workflow) => {
    setCurrentApp(prevApp => {
      const updatedApp = { ...prevApp, workflow: newWorkflow };
      onUpdateApp(updatedApp);
      return updatedApp;
    });
  }, [onUpdateApp]);
  
  const handleCompleteWorkflowStep = useCallback((caseId: string, fromStepId: string, chosenNextStepId?: string) => {
      const workflow = currentApp.workflow;
      const originalCase = allCases.find(c => c.id === caseId);
      if (!originalCase) return;

      const outgoingEdges = workflow.edges.filter(e => e.source === fromStepId);
      if (outgoingEdges.length === 0) {
          console.warn(`No outgoing edge from step ${fromStepId}`);
          return;
      }
      
      let nextStepId: string | null = null;
      if (outgoingEdges.length === 1) {
          nextStepId = outgoingEdges[0].target;
      } else if (chosenNextStepId) {
          const edgeExists = outgoingEdges.some(e => e.target === chosenNextStepId);
          if (edgeExists) {
              nextStepId = chosenNextStepId;
          }
      } 
      
      if (!nextStepId && outgoingEdges.length > 0) {
        // Default to first edge if none chosen (e.g. from a FILL form completion)
        nextStepId = outgoingEdges[0].target;
      }
      
      if (!nextStepId) return;

      const nextStep = workflow.nodes.find(n => n.id === nextStepId);

      const newHistoryEntry: WorkflowEvent = {
          stepId: fromStepId,
          userId: currentUser!.id,
          completedAt: new Date().toISOString(),
      };

      const isClosing = nextStep?.type === 'End';
      let nextAssignee = originalCase.assignee;
      if (nextStep?.assigneeId) {
          const foundUser = users.find(u => u.id === nextStep.assigneeId);
          if (foundUser) {
              nextAssignee = foundUser;
          }
      }

      const updatedCase: Case = {
          ...originalCase,
          currentWorkflowStepId: nextStepId,
          workflowHistory: [...originalCase.workflowHistory, newHistoryEntry],
          status: isClosing ? CaseStatus.Closed : originalCase.status,
          assignee: nextAssignee,
      };
      
      onUpdateCase(updatedCase);
      // Also update the selected case in the modal if it's open
      if (selectedCase?.id === caseId) {
          setSelectedCase(updatedCase);
      }
      
      if(isClosing) {
          handleCloseModal();
      }

  }, [currentApp.workflow, currentUser, users, allCases, onUpdateCase, selectedCase, handleCloseModal]);

  const handleCaseStepChange = useCallback((caseId: string, newStepId: string) => {
    const originalCase = allCases.find(c => c.id === caseId);
    if (!originalCase) return;

    const stepNode = currentApp.workflow.nodes.find(n => n.id === newStepId);
    if (!stepNode) return;

    let newStatus = originalCase.status;
    if (stepNode.type === 'Start') newStatus = CaseStatus.New;
    else if (stepNode.type === 'End') newStatus = CaseStatus.Closed;
    else newStatus = CaseStatus.InProgress;

    const updatedCase = { ...originalCase, currentWorkflowStepId: newStepId, status: newStatus };
    onUpdateCase(updatedCase);

  }, [currentApp.workflow.nodes, allCases, onUpdateCase]);

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
      <Sidebar app={app} onExit={onExit} activeView={activeView} setActiveView={setActiveView} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header onNewCaseClick={handleOpenNewCaseModal} activeView={activeView} appName={app.name} />
        <main className="flex-1 overflow-x-auto p-4 md:p-6">
          {activeView === 'Boards' && (
            <KanbanBoard 
              columns={kanbanColumns} 
              cases={appCases} 
              onCaseClick={handleOpenCaseDetails}
              onCaseStepChange={handleCaseStepChange}
            />
          )}
          {activeView === 'Cases' && (
            <CaseListView cases={appCases} onCaseClick={handleOpenCaseDetails} />
          )}
          {activeView === 'Reports' && (
            <ReportsView />
          )}
          {activeView === 'Settings' && (
            <SettingsView workflow={currentApp.workflow} onWorkflowChange={handleWorkflowChange} />
          )}
        </main>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {isCreatingNewCase && (
            <NewCaseForm onAddCase={handleAddCaseLocal} onCancel={handleCloseModal} />
        )}
        {selectedCase && !isCreatingNewCase && (
            <CaseDetailView 
                caseData={selectedCase} 
                onUpdateCase={onUpdateCase}
                appWorkflow={currentApp.workflow}
                onCompleteStep={handleCompleteWorkflowStep}
            />
        )}
      </Modal>
    </div>
  );
}