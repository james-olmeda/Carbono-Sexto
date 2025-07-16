
import React from 'react';
import { BuilderNode, BuilderEdge } from '../types';
import BuilderNodeComponent from './BuilderNode';
import { useAuth } from '../contexts/AuthContext';

interface WorkflowCanvasProps {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onNodeDragStart: (e: React.DragEvent<HTMLDivElement>, nodeId: string) => void;
  onNodeClick: (nodeId: string) => void;
  onConnectStart: (e: React.MouseEvent, nodeId: string) => void;
  onConnectEnd: (e: React.MouseEvent, nodeId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  connectionLine?: { sourceId: string, x2: number, y2: number } | null;
  isConnecting: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, edges, onDragOver, onDrop, onNodeDragStart, onNodeClick, onConnectStart, onConnectEnd, canvasRef, connectionLine, isConnecting }) => {
  const { users } = useAuth();
  
  const getNodeUser = (node: BuilderNode) => {
    if (!node.assigneeId) return null;
    return users.find(u => u.id === node.assigneeId);
  }

  const getNodeCenter = (node: BuilderNode | undefined) => {
    if(!node) return {x: 0, y: 0};
    return { x: node.x + 48, y: node.y + 48 };
  }

  const getRadiusAtAngle = (node: BuilderNode, angle: number) => {
      const halfWidth = 48; // w-24 -> 96px, so radius/half-width is 48
      if (node.type === 'Gateway') {
          // For a diamond (a square rotated by 45 degrees), the formula for the radius is derived from its geometry.
          // The bounding box is 96x96, so the distance from center to a vertex is 48.
          // The formula for a diamond with vertices on the axes is r(θ) = L / (|cosθ| + |sinθ|), where L is the distance from center to an axis intercept. Here L=48.
          return 48 / (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
      }
      // For circles, the radius is constant
      return halfWidth;
  };

  return (
    <div
      ref={canvasRef}
      className="flex-grow h-full relative bg-white dark:bg-black/10 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-label="Workflow canvas"
    >
      {/* Background Grid */}
      <svg width="100%" height="100%" className="absolute inset-0 z-0">
        <defs>
          <pattern id="smallGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(0,0,0,0.05)" className="dark:stroke-[rgba(255,255,255,0.05)]" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="url(#smallGrid)"/>
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0,0,0,0.1)" className="dark:stroke-[rgba(255,255,255,0.1)]" strokeWidth="1"/>
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-gray-400 dark:text-gray-500" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Edges */}
        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          const sourceCenter = getNodeCenter(sourceNode);
          const targetCenter = getNodeCenter(targetNode);

          const dx = targetCenter.x - sourceCenter.x;
          const dy = targetCenter.y - sourceCenter.y;
          
          if (dx === 0 && dy === 0) return null;

          const angle = Math.atan2(dy, dx);
          const distance = Math.hypot(dx, dy);

          const sourceRadius = getRadiusAtAngle(sourceNode, angle);
          const targetRadius = getRadiusAtAngle(targetNode, angle + Math.PI);

          const ux = dx / distance;
          const uy = dy / distance;
          
          const arrowPadding = 5;

          const x1 = sourceCenter.x + ux * sourceRadius;
          const y1 = sourceCenter.y + uy * sourceRadius;
          
          const x2 = targetCenter.x - ux * (targetRadius + arrowPadding);
          const y2 = targetCenter.y - uy * (targetRadius + arrowPadding);

          return <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" className="stroke-gray-400 dark:stroke-gray-500" markerEnd="url(#arrow)" />;
        })}
        {/* Connection Line */}
        {connectionLine && (() => {
           const sourceNode = nodes.find(n => n.id === connectionLine.sourceId);
           if (!sourceNode) return null;
           
           const sourceCenter = getNodeCenter(sourceNode);
           
           const dx = connectionLine.x2 - sourceCenter.x;
           const dy = connectionLine.y2 - sourceCenter.y;
           const angle = Math.atan2(dy, dx);
           const distance = Math.hypot(dx, dy);
           if(distance === 0) return null;

           const ux = dx / distance;
           const uy = dy / distance;

           const sourceRadius = getRadiusAtAngle(sourceNode, angle);
           const x1 = sourceCenter.x + ux * sourceRadius;
           const y1 = sourceCenter.y + uy * sourceRadius;

           return <line x1={x1} y1={y1} x2={connectionLine.x2} y2={connectionLine.y2} strokeWidth="2" className="stroke-blue-500" markerEnd="url(#arrow)" />;
        })()}
      </svg>
      
      {/* Nodes */}
      <div className="relative z-10 w-full h-full">
        {nodes.map((node) => (
          <BuilderNodeComponent
            key={node.id}
            node={node}
            onDragStart={onNodeDragStart}
            onClick={onNodeClick}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            user={getNodeUser(node)}
            isConnecting={isConnecting}
          />
        ))}
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/50 dark:bg-black/50 px-2 py-1 rounded">
          Click a node to edit. Drag handle to connect.
      </div>
    </div>
  );
};

export default WorkflowCanvas;
