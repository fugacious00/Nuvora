import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Network, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Layers, 
  ExternalLink, 
  X,
  Info
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem } from '../../types';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  topics: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connectionsCount: number;
}

interface GraphLink {
  sourceId: string;
  targetId: string;
  reason: string;
  type: string;
}

export const GraphView: React.FC = () => {
  const { 
    items, 
    setSelectedItemId, 
    runGraphConnectionAnalysis, 
    isAnalyzingConnections 
  } = useKnowledge();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate node colors based on item type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return '#7B61FF';
      case 'idea': return '#FFB86B';
      case 'document': return '#4C9CFF';
      case 'voice': return '#22D3A6';
      case 'meeting': return '#EC4899';
      case 'web': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  // Build nodes and links data
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const linkList: GraphLink[] = [];

    // Initialize circular positions
    const centerX = 400;
    const centerY = 300;
    const radius = 220;

    items.forEach((item, idx) => {
      const angle = (idx / items.length) * 2 * Math.PI;
      const connCount = item.connections?.length || 0;
      nodeMap.set(item.id, {
        id: item.id,
        title: item.title,
        type: item.type,
        topics: item.topics || [],
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 60,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        radius: 12 + Math.min(connCount * 3, 14),
        color: getTypeColor(item.type),
        connectionsCount: connCount,
      });

      // Connections
      if (item.connections) {
        item.connections.forEach((conn) => {
          linkList.push({
            sourceId: item.id,
            targetId: conn.targetId,
            reason: conn.reason,
            type: conn.type,
          });
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: linkList,
    };
  }, [items]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Pan & Zoom transform
      ctx.translate(pan.x + canvas.width / 2, pan.y + canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 1. Draw Links
      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.sourceId);
        const target = nodes.find((n) => n.id === link.targetId);
        if (!source || !target) return;

        const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted ? '#7B61FF' : '#E2E8F0';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.stroke();
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isConnected = selectedNode && links.some(
          (l) => (l.sourceId === selectedNode.id && l.targetId === node.id) ||
                 (l.targetId === selectedNode.id && l.sourceId === node.id)
        );

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#7B61FF' : node.color;
        ctx.fill();

        // Node ring if selected or connected
        if (isSelected || isConnected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = isSelected ? '#7B61FF' : '#4C9CFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Title Label
        ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = isSelected ? '#0B0F19' : '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.title.length > 20 ? node.title.slice(0, 18) + '…' : node.title,
          node.x,
          node.y + node.radius + 14
        );
      });

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, links, selectedNode, zoom, pan]);

  // Click on canvas to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse coordinates into world coordinates
    const worldX = (mouseX - (pan.x + canvas.width / 2)) / zoom + canvas.width / 2;
    const worldY = (mouseY - (pan.y + canvas.height / 2)) / zoom + canvas.height / 2;

    const clickedNode = nodes.find((n) => {
      const dist = Math.hypot(n.x - worldX, n.y - worldY);
      return dist <= n.radius + 6;
    });

    setSelectedNode(clickedNode || null);
  };

  const selectedItem = selectedNode ? items.find((i) => i.id === selectedNode.id) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
              Connections Graph
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEF5FF] text-[#4C9CFF] font-semibold">
              {links.length} discovered relationships
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual map of semantic proximity, conceptual bridges, and cross-domain links.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={runGraphConnectionAnalysis}
            disabled={isAnalyzingConnections}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingConnections ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingConnections ? 'Scanning AI Graph...' : 'Discover AI Links'}</span>
          </button>
        </div>
      </div>

      {/* Graph Visual Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[600px] bg-[#FAFBFD] rounded-3xl border border-[#EAEBF0] overflow-hidden shadow-xs"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={600}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating Zoom & Controls */}
        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-[#EAEBF0] shadow-xs">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
          >
            Reset
          </button>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-[#EAEBF0] shadow-xs space-y-1.5 text-[11px]">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
            Node Formats
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7B61FF]" />
              <span>Notes</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFB86B]" />
              <span>Ideas</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4C9CFF]" />
              <span>Documents</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22D3A6]" />
              <span>Voice</span>
            </span>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedItem && (
          <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#7B61FF]/30 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#7B61FF]">
                {selectedItem.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {selectedItem.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-1">
                {selectedItem.rawSummary || selectedItem.content}
              </p>
            </div>

            {/* Connected Links from this node */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Connected Ideas ({selectedItem.connections?.length || 0})
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(selectedItem.connections || []).map((conn, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-[#FAFBFD] border border-slate-100">
                    <span className="font-semibold text-slate-800">{conn.targetTitle}</span>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">"{conn.reason}"</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedItemId(selectedItem.id)}
              className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold hover:opacity-95"
            >
              <span>Inspect Full Note</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
