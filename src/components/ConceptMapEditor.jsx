import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button'; // Import your Shadcn Button
import CustomNode from './Node';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = []; // Start with empty nodes
const initialEdges = [];

function ConceptMapEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const simulationRef = useRef(null); // Create a ref for the simulation
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and run the force simulation
  useEffect(() => {
    const width = 800; // Or get the width dynamically
    const height = 600; // Or get the height dynamically

    // Update the positions of existing nodes
    const updateNodePositions = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          position: { x: node.x, y: node.y },
        })),
      );
    };

    // Create and start the simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(edges).id((d) => d.id),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', updateNodePositions);

    simulationRef.current = simulation;

    return () => simulation.stop(); // Clean up the simulation on unmount
  }, [edges, nodes]);

  const handleNodeDataChange = useCallback(
    (updatedNode) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === updatedNode.id
            ? { ...node, data: updatedNode.data }
            : node,
        ),
      );
    },
    [setNodes],
  );

  // Add/Update nodes once the simulation is initialized
  useEffect(() => {
    if (simulationRef.current && !isInitialized) {
      const newNodes = [
        {
          id: '1',
          type: 'custom',
          data: { label: 'Node 1', onChange: handleNodeDataChange },
          position: { x: 0, y: 0 }, // Initial position (will be updated by the simulation)
        },
        {
          id: '2',
          type: 'custom',
          data: { label: 'Node 2', onChange: handleNodeDataChange },
          position: { x: 0, y: 0 }, // Initial position (will be updated by the simulation)
        },
      ];
      
      // Reset the simulation with new nodes
      simulationRef.current.nodes(newNodes);
      simulationRef.current.alpha(0.8).restart();

      setNodes(newNodes);
      setIsInitialized(true);
    }
  }, [isInitialized, handleNodeDataChange]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Function to add a new node
  const addNode = useCallback(() => {
    const id = `${nodes.length + 1}`;
    const newNode = {
      id,
      type: 'custom',
      data: { label: `Node ${id}`, onChange: handleNodeDataChange },
      position: { x: 0, y: 0 }, // Initial position (will be updated by the simulation)
    };

    // Update the nodes in the state
    setNodes((nds) => nds.concat(newNode));

    // Update the simulation with the new nodes
    simulationRef.current.nodes([...nodes, newNode]);
    simulationRef.current.alpha(0.8).restart();
  }, [nodes, handleNodeDataChange, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Button onClick={addNode}>Add Node</Button>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default ConceptMapEditor;