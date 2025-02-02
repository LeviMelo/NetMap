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
import { Button } from '@/components/ui/button';
import CustomNode from './Node';
import { Input } from "@/components/ui/input";

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

function ConceptMapEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const simulationRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mermaidInput, setMermaidInput] = useState('');

  useEffect(() => {
    const width = 800;
    const height = 600;

    const updateNodePositions = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          position: { x: node.x, y: node.y },
        })),
      );
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(edges).id((d) => d.id).distance(100),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', updateNodePositions);

    simulationRef.current = simulation;

    return () => simulation.stop();
  }, [edges, nodes]);

  const handleNodeDataChange = useCallback(
    (updatedNode) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === updatedNode.id ? { ...node, data: updatedNode.data } : node
        )
      );
    },
    [setNodes]
  );

  useEffect(() => {
    if (simulationRef.current && !isInitialized) {
      const newNodes = [
        {
          id: '1',
          type: 'custom',
          data: { label: 'Concept 1', onChange: handleNodeDataChange },
          position: { x: 200, y: 200 },
        },
        {
          id: '2',
          type: 'custom',
          data: { label: 'Concept 2', onChange: handleNodeDataChange },
          position: { x: 400, y: 400 },
        },
      ];

      simulationRef.current.nodes(newNodes);
      simulationRef.current.force('link').links(initialEdges);
      simulationRef.current.alpha(0.8).restart();

      setNodes(newNodes);
      setEdges(initialEdges);
      setIsInitialized(true);
    }
  }, [isInitialized, handleNodeDataChange]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = useCallback(() => {
    const id = `${nodes.length + 1}`;
    const newNode = {
      id,
      type: 'custom',
      data: { label: `New Node`, onChange: handleNodeDataChange },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    };

    setNodes((nds) => nds.concat(newNode));
    simulationRef.current.nodes([...nodes, newNode]);
    simulationRef.current.alpha(0.8).restart();
  }, [nodes, handleNodeDataChange, setNodes]);

  const handleInputChange = (event) => {
    setMermaidInput(event.target.value);
    console.log("Mermaid Input Changed:", event.target.value);
  };

  const handleExport = () => {
    console.log("Exporting Diagram - Functionality not implemented yet");
  };

  return (
    <div className="flex flex-col h-screen"> {/* 1. Main container: vertical flex, full height */}

      {/* Buttons row */}
      <div className="flex space-x-2 p-4">
        <Button onClick={addNode}>Add Node</Button>
        <Button onClick={handleExport} variant="secondary">Export</Button>
      </div>

      {/* Horizontal Splitter */}
      <div className="flex flex-1"> {/* 2. Side-by-side container: horizontal flex, take remaining space */}

        {/* Input Area */}
        <div className="w-2/5 p-4 border-r"> {/* 3. Input area: 2/5 width */}
          <Input
            type="textarea"
            placeholder="Enter Mermaid or Graphviz code here (not yet implemented)"
            className="w-full h-full resize-none"
            value={mermaidInput}
            onChange={handleInputChange}
            disabled
          />
        </div>

        {/* Map Container */}
        <div className="flex-1"> {/* 4. Map container: remaining width */}
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

      </div>
    </div>
  );
}

export default ConceptMapEditor;