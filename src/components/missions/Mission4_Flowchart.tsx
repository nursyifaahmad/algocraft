"use client";

import React, { useState, useRef } from "react";
import { FLOWCHART_ITEMS, FlowchartNodeData } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Share2,
  X,
  Undo2,
} from "lucide-react";

interface CanvasNode {
  id: string;
  itemId: string; // ID dari FLOWCHART_ITEMS
  chosenType: "terminator" | "io" | "process" | "decision";
  label: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: "YA" | "TIDAK";
}

interface Mission4Props {
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

// Dimensi standar untuk masing-masing bentuk
const NODE_DIMS = {
  terminator: { w: 190, h: 48 },
  io: { w: 210, h: 52 },
  process: { w: 210, h: 52 },
  decision: { w: 210, h: 80 },
};

export const Mission4_Flowchart: React.FC<Mission4Props> = ({ onSuccess, onWrongAttempt }) => {
  // Kanvas kertas kosong murni
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Dialog pembuatan simbol baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedShapeTool, setSelectedShapeTool] = useState<
    "terminator" | "io" | "process" | "decision" | null
  >(null);
  const [selectedTextId, setSelectedTextId] = useState<string>("");

  // Dialog pertanyaan jalur YA / TIDAK untuk simbol Decision
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [pendingSourceId, setPendingSourceId] = useState<string | null>(null);

  // Status penarikan garis alur
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [activeBranchLabel, setActiveBranchLabel] = useState<"YA" | "TIDAK" | undefined>(undefined);

  // Status drag & drop
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hasil asesmen
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctSymbolsCount: number;
    validConnectionsCount: number;
    rubricScore: number;
    percentage: number;
    isPass: boolean;
    errors: string[];
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Daftar teks yang belum dimasukkan ke kanvas
  const usedItemIds = new Set(nodes.map((n) => n.itemId));
  const availableTexts = FLOWCHART_ITEMS.filter((item) => !usedItemIds.has(item.id));

  // 1. Tambah simbol baru ke kanvas kertas kosong
  const handleCreateNode = () => {
    if (!selectedShapeTool || !selectedTextId) return;

    const targetItem = FLOWCHART_ITEMS.find((it) => it.id === selectedTextId);
    if (!targetItem) return;

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const spawnX = canvasBounds ? Math.max(20, Math.min(320, canvasBounds.width / 2 - 100)) : 160;
    const spawnY = 40 + (nodes.length % 5) * 85;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      itemId: targetItem.id,
      chosenType: selectedShapeTool,
      label: targetItem.label,
      x: spawnX,
      y: spawnY,
    };

    setNodes((prev) => [...prev, newNode]);
    setShowAddModal(false);
    setSelectedShapeTool(null);
    setSelectedTextId("");
    setSelectedNodeId(newNode.id);
  };

  // 2. Mulai penarikan panah (Revisi 2: Ada pertanyaan jika dari Decision)
  const handleStartConnect = (nodeId: string) => {
    const sourceNode = nodes.find((n) => n.id === nodeId);
    if (!sourceNode) return;

    if (sourceNode.chosenType === "decision") {
      // Buka modal pertanyaan apakah untuk jalur YA atau TIDAK
      setPendingSourceId(nodeId);
      setShowBranchModal(true);
    } else {
      setConnectingSourceId(nodeId);
      setActiveBranchLabel(undefined);
    }
  };

  const handleConfirmBranch = (branch: "YA" | "TIDAK") => {
    if (!pendingSourceId) return;
    setConnectingSourceId(pendingSourceId);
    setActiveBranchLabel(branch);
    setShowBranchModal(false);
    setPendingSourceId(null);
  };

  // 3. Menghubungkan ke simbol tujuan
  const handleNodeClick = (nodeId: string) => {
    if (submitted) return;

    if (connectingSourceId) {
      if (connectingSourceId === nodeId) {
        // Batal jika klik diri sendiri
        setConnectingSourceId(null);
        setActiveBranchLabel(undefined);
        return;
      }

      // Cegah duplikasi koneksi yang sama
      const alreadyExists = connections.some(
        (c) => c.fromId === connectingSourceId && c.toId === nodeId
      );

      if (!alreadyExists) {
        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          fromId: connectingSourceId,
          toId: nodeId,
          label: activeBranchLabel,
        };
        setConnections((prev) => [...prev, newConn]);
      }

      setConnectingSourceId(null);
      setActiveBranchLabel(undefined);
      setSelectedNodeId(nodeId);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  // 4. Drag & Drop Sistem (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (submitted || connectingSourceId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - canvasRect.left - node.x,
      y: e.clientY - canvasRect.top - node.y,
    });
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const node = nodes.find((n) => n.id === draggingNodeId);
    const dims = node ? NODE_DIMS[node.chosenType] : { w: 200, h: 50 };

    const newX = Math.max(10, Math.min(canvasRect.width - dims.w - 10, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - dims.h - 10, e.clientY - canvasRect.top - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleTouchStart = (e: React.TouchEvent, nodeId: string) => {
    if (submitted || connectingSourceId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: touch.clientX - canvasRect.left - node.x,
      y: touch.clientY - canvasRect.top - node.y,
    });
    setSelectedNodeId(nodeId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingNodeId || !canvasRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const node = nodes.find((n) => n.id === draggingNodeId);
    const dims = node ? NODE_DIMS[node.chosenType] : { w: 200, h: 50 };

    const newX = Math.max(10, Math.min(canvasRect.width - dims.w - 10, touch.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - dims.h - 10, touch.clientY - canvasRect.top - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromId !== nodeId && c.toId !== nodeId)
    );
    setSelectedNodeId(null);
    setConnectingSourceId(null);
  };

  const handleUndoConnection = () => {
    setConnections((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setConnectingSourceId(null);
    setSubmitted(false);
    setResult(null);
  };

  // 5. Kalkulasi Garis Alur Otomatis Tegak Lurus (Orthogonal / Manhattan Routing)
  const calculateOrthogonalPath = (conn: Connection) => {
    const fromNode = nodes.find((n) => n.id === conn.fromId);
    const toNode = nodes.find((n) => n.id === conn.toId);
    if (!fromNode || !toNode) return null;

    const fromDims = NODE_DIMS[fromNode.chosenType];
    const toDims = NODE_DIMS[toNode.chosenType];

    // Titik pusat
    const fromCenter = { x: fromNode.x + fromDims.w / 2, y: fromNode.y + fromDims.h / 2 };
    const toCenter = { x: toNode.x + toDims.w / 2, y: toNode.y + toDims.h / 2 };

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let pathD = "";
    let labelPos = { x: 0, y: 0 };

    // Kasus 1: Cabang TIDAK dari Decision (keluar dari kanan belah ketupat)
    if (fromNode.chosenType === "decision" && conn.label === "TIDAK") {
      startX = fromNode.x + fromDims.w; // Sisi kanan belah ketupat
      startY = fromNode.y + fromDims.h / 2;

      // Jika node tujuan berada di bawah atau kanan
      endX = toNode.x + toDims.w / 2;
      endY = toNode.y; // Atas simbol tujuan

      // Garis horizontal ke kanan lalu lurus vertikal ke bawah
      pathD = `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
      labelPos = { x: (startX + endX) / 2, y: startY - 8 };
    }
    // Kasus 2: Arah Turun Vertikal (Top to Bottom)
    else if (toCenter.y > fromCenter.y + 20) {
      startX = fromNode.x + fromDims.w / 2;
      startY = fromNode.y + fromDims.h; // Bawah simbol asal
      endX = toNode.x + toDims.w / 2;
      endY = toNode.y; // Atas simbol tujuan

      // Jika posisi horizontal hampir sejajar (selisih < 20px), luruskan otomatis
      if (Math.abs(startX - endX) < 20) {
        endX = startX;
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: startX + 16, y: (startY + endY) / 2 };
      } else {
        // Garis siku-siku bertingkat (Z / Siku 90 derajat)
        const midY = (startY + endY) / 2;
        pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
        labelPos = { x: startX + 16, y: (startY + midY) / 2 };
      }
    }
    // Kasus 3: Horizontal (Kiri ke Kanan)
    else if (toCenter.x > fromCenter.x + 20) {
      startX = fromNode.x + fromDims.w;
      startY = fromNode.y + fromDims.h / 2;
      endX = toNode.x;
      endY = toNode.y + toDims.h / 2;

      if (Math.abs(startY - endY) < 15) {
        endY = startY;
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 8 };
      } else {
        const midX = (startX + endX) / 2;
        pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        labelPos = { x: (startX + midX) / 2, y: startY - 8 };
      }
    }
    // Kasus 4: Default Lurus Siku
    else {
      startX = fromNode.x + fromDims.w / 2;
      startY = fromNode.y + fromDims.h;
      endX = toNode.x + toDims.w / 2;
      endY = toNode.y;
      const midY = (startY + endY) / 2;
      pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
      labelPos = { x: startX + 16, y: (startY + midY) / 2 };
    }

    return { pathD, labelPos, label: conn.label };
  };

  // 6. Validasi Autentik Flowchart
  const handleSubmit = () => {
    const errors: string[] = [];
    let correctSymbolsCount = 0;

    // Evaluasi 1: Apakah murid memilih bentuk simbol yang benar untuk setiap instruksi?
    FLOWCHART_ITEMS.forEach((originalItem) => {
      const placed = nodes.find((n) => n.itemId === originalItem.id);
      if (!placed) {
        errors.push(`Instruksi "${originalItem.label}" belum dimasukkan ke kanvas.`);
      } else {
        if (placed.chosenType === originalItem.type) {
          correctSymbolsCount += 1;
        } else {
          const typeName =
            originalItem.type === "terminator"
              ? "Terminator (Oval)"
              : originalItem.type === "io"
              ? "Input/Output (Jajar Genjang)"
              : originalItem.type === "process"
              ? "Proses (Persegi Panjang)"
              : "Decision (Belah Ketupat)";
          errors.push(
            `Simbol untuk "${originalItem.label}" salah bentuk. Seharusnya menggunakan ${typeName}.`
          );
        }
      }
    });

    // Evaluasi 2: Alur koneksi percabangan
    let validConnectionsCount = 0;
    const startNode = nodes.find((n) => n.itemId === "fc-start");
    const endNode = nodes.find((n) => n.itemId === "fc-end");
    const decisionNode = nodes.find((n) => n.itemId === "fc-decision");

    if (startNode && connections.some((c) => c.fromId === startNode.id)) {
      validConnectionsCount += 1;
    }
    if (endNode && connections.some((c) => c.toId === endNode.id)) {
      validConnectionsCount += 1;
    }

    if (decisionNode) {
      const hasYa = connections.some((c) => c.fromId === decisionNode.id && c.label === "YA");
      const hasTidak = connections.some((c) => c.fromId === decisionNode.id && c.label === "TIDAK");
      if (hasYa) validConnectionsCount += 1;
      else errors.push("Cabang [YA] dari Decision (Belah Ketupat) belum dihubungkan.");
      if (hasTidak) validConnectionsCount += 1;
      else errors.push("Cabang [TIDAK] dari Decision (Belah Ketupat) belum dihubungkan.");
    }

    const totalExpectedSymbols = FLOWCHART_ITEMS.length; // 7

    let rubricScore = 1;
    if (correctSymbolsCount === totalExpectedSymbols && validConnectionsCount >= 4 && errors.length === 0) {
      rubricScore = 4;
    } else if (correctSymbolsCount >= 5 && validConnectionsCount >= 3) {
      rubricScore = 3;
    } else if (correctSymbolsCount >= 4) {
      rubricScore = 2;
    } else {
      rubricScore = 1;
    }

    const percentage = Math.round((correctSymbolsCount / totalExpectedSymbols) * 100);
    const isPass = rubricScore >= 3;

    setResult({
      correctSymbolsCount,
      validConnectionsCount,
      rubricScore,
      percentage,
      isPass,
      errors,
    });
    setSubmitted(true);

    if (isPass) {
      onSuccess(percentage, rubricScore, { nodes, connections });
    } else {
      onWrongAttempt();
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-4">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Misi 4: Desain Diagram Alir Mandiri (Kertas Gambar Kosong)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Rancanglah diagram alir algoritma kasir kantin di atas <strong>kertas kosong</strong>. Pilih
          bentuk simbol yang tepat, tempatkan di kanvas, dan hubungkan garis alurnya dengan panah siku tegak lurus.
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• Hubungkan garis dari simbol asal ke simbol tujuan. Garis akan otomatis lurus tegak siku!</span>
        </div>
      </div>

      {/* Toolbar Kertas Gambar (Alat Simbol) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-1">Alat Simbol:</span>

          <button
            disabled={submitted || availableTexts.length === 0}
            onClick={() => {
              setSelectedShapeTool("terminator");
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span className="w-3.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 inline-block" />
            <span>+ Terminator</span>
          </button>

          <button
            disabled={submitted || availableTexts.length === 0}
            onClick={() => {
              setSelectedShapeTool("io");
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span className="w-3.5 h-2.5 skew-x-[-12deg] bg-sky-500 border border-sky-600 inline-block" />
            <span>+ Input / Output</span>
          </button>

          <button
            disabled={submitted || availableTexts.length === 0}
            onClick={() => {
              setSelectedShapeTool("process");
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span className="w-3.5 h-2.5 bg-indigo-500 border border-indigo-600 inline-block" />
            <span>+ Proses</span>
          </button>

          <button
            disabled={submitted || availableTexts.length === 0}
            onClick={() => {
              setSelectedShapeTool("decision");
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-amber-600 inline-block" />
            <span>+ Decision (IF)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {connections.length > 0 && !submitted && (
            <button
              onClick={handleUndoConnection}
              className="text-xs text-slate-600 hover:text-slate-800 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              title="Hapus garis panah terakhir"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Hapus Garis Terakhir</span>
            </button>
          )}

          {nodes.length > 0 && !submitted && (
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              Bersihkan Kertas
            </button>
          )}
        </div>
      </div>

      {/* Kanvas Kertas Kotak-Kotak Kosong (Millimeter Graph Paper) */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{
          backgroundImage:
            "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        className="relative w-full h-[640px] bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-inner select-none"
      >
        {/* Pesan Kertas Kosong */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Kertas Diagram Alir Kosong</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Gunakan tombol di atas untuk memilih bentuk simbol dan memasukkan teks algoritma kantin.
            </p>
          </div>
        )}

        {/* Petunjuk saat Menarik Garis Panah */}
        {connectingSourceId && (
          <div className="absolute top-4 left-4 z-30 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg animate-bounce flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>
              Ketuk simbol tujuan untuk panah alur
              {activeBranchLabel ? ` (Jalur ${activeBranchLabel})` : ""}
            </span>
            <button
              onClick={() => {
                setConnectingSourceId(null);
                setActiveBranchLabel(undefined);
              }}
              className="ml-2 hover:bg-amber-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SVG Render Garis Panah Tegak Lurus (Orthogonal) & Ujung Panah Jelas (Revisi 1 & 3) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <marker
              id="arrowhead-orthogonal"
              markerWidth="12"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
            >
              <path d="M 0 1 L 11 5 L 0 9 z" fill="#0f172a" />
            </marker>
          </defs>

          {connections.map((conn) => {
            const pathData = calculateOrthogonalPath(conn);
            if (!pathData) return null;

            return (
              <g key={conn.id}>
                {/* Garis Panah Otomatis Lurus Tegak Siku */}
                <path
                  d={pathData.pathD}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                  markerEnd="url(#arrowhead-orthogonal)"
                />

                {/* Label Percabangan [YA] atau [TIDAK] */}
                {pathData.label && (
                  <g transform={`translate(${pathData.labelPos.x}, ${pathData.labelPos.y})`}>
                    <rect
                      x="-22"
                      y="-11"
                      width="44"
                      height="18"
                      rx="4"
                      fill={pathData.label === "YA" ? "#ecfdf5" : "#fef2f2"}
                      stroke={pathData.label === "YA" ? "#10b981" : "#ef4444"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="2"
                      fill={pathData.label === "YA" ? "#047857" : "#b91c1c"}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {pathData.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Simbol-Simbol Bebas di Kertas */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isSource = connectingSourceId === node.id;

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                position: "absolute",
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onTouchStart={(e) => handleTouchStart(e, node.id)}
              onClick={() => handleNodeClick(node.id)}
              className={`cursor-grab active:cursor-grabbing z-10 transition-shadow ${
                isSource
                  ? "ring-4 ring-amber-400 ring-offset-2 shadow-lg"
                  : isSelected
                  ? "ring-2 ring-indigo-500 shadow-md"
                  : "hover:shadow-md"
              }`}
            >
              {/* 1. TERMINATOR (OVAL) */}
              {node.chosenType === "terminator" && (
                <div className="relative w-[190px] h-[48px] flex items-center justify-center bg-transparent">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 190 48" preserveAspectRatio="none">
                    <rect x="2" y="2" width="186" height="44" rx="22" ry="22" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-4 text-center font-bold text-xs text-emerald-950 pointer-events-none">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 2. INPUT / OUTPUT (JAJAR GENJANG MIRING) */}
              {node.chosenType === "io" && (
                <div className="relative w-[210px] h-[52px] flex items-center justify-center bg-transparent">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 52" preserveAspectRatio="none">
                    <polygon points="18,2 208,2 192,50 2,50" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-6 text-center font-semibold text-[11px] leading-tight text-sky-950 pointer-events-none">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 3. PROSES (PERSEGI PANJANG SIKU-SIKU) */}
              {node.chosenType === "process" && (
                <div className="relative w-[210px] h-[52px] flex items-center justify-center bg-transparent">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 52" preserveAspectRatio="none">
                    <rect x="2" y="2" width="206" height="48" rx="0" ry="0" fill="#eef2ff" stroke="#4f46e5" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-3 text-center font-mono font-semibold text-[11px] leading-tight text-indigo-950 pointer-events-none">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 4. DECISION (BELAH KETUPAT / DIAMOND) */}
              {node.chosenType === "decision" && (
                <div className="relative w-[210px] h-[80px] flex items-center justify-center bg-transparent">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 80" preserveAspectRatio="none">
                    <polygon points="105,2 208,40 105,78 2,40" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-8 text-center font-bold text-[11px] leading-tight text-amber-950 pointer-events-none">
                    {node.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* BILAH TINDAKAN BAWAH (DOCK) - REVISI 4: Tidak menghalangi teks simbol sama sekali */}
        {selectedNode && !submitted && !connectingSourceId && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 z-30 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <span className="text-amber-400 font-bold">Terpilih:</span>
              <span className="max-w-[180px] truncate text-white">&quot;{selectedNode.label}&quot;</span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <button
              onClick={() => handleStartConnect(selectedNode.id)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Tarik Panah ➔</span>
            </button>

            <button
              onClick={() => handleDeleteNode(selectedNode.id)}
              className="px-2.5 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Hapus Simbol dari Kertas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>

            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              title="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Simbol terpasang: {nodes.length} dari {FLOWCHART_ITEMS.length} | Garis alur: {connections.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Bagan Alir Mandiri Tuntas! Skor Rubrik: {result.rubricScore}/4 ({result.percentage}%)
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Skor: {result?.rubricScore}/4 (Belum Tuntas). -1 Nyawa.</span>
                    {result?.errors.slice(0, 2).map((err, i) => (
                      <p key={i} className="text-[11px] font-normal text-rose-600 mt-0.5">• {err}</p>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Buat Ulang Diagram
                  </button>
                </div>
              </div>
            )
          ) : (
            <button
              disabled={nodes.length < 4}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Uji Diagram Alir Mandiri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialog 1: Memilih Teks Instruksi untuk Bentuk yang Dipilih */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 inline-block ${
                    selectedShapeTool === "terminator"
                      ? "rounded-full bg-emerald-500"
                      : selectedShapeTool === "io"
                      ? "skew-x-[-12deg] bg-sky-500"
                      : selectedShapeTool === "process"
                      ? "bg-indigo-500"
                      : "rotate-45 bg-amber-500"
                  }`}
                />
                <h3 className="text-sm font-bold text-slate-800">
                  Buat Simbol{" "}
                  {selectedShapeTool === "terminator"
                    ? "Terminator"
                    : selectedShapeTool === "io"
                    ? "Input / Output"
                    : selectedShapeTool === "process"
                    ? "Proses"
                    : "Decision (Keputusan)"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pilihlah teks instruksi algoritma kantin yang menurutmu <strong>paling tepat</strong>{" "}
              menggunakan bentuk simbol ini:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableTexts.map((item) => {
                const isSelected = selectedTextId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTextId(item.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300 font-bold text-amber-950"
                        : "bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={!selectedTextId}
                onClick={handleCreateNode}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tempatkan di Kertas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog 2: Pertanyaan Pemilihan Jalur YA atau TIDAK untuk Simbol Decision (Revisi 2) */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-3.5 h-3.5 rotate-45 bg-amber-500 border border-amber-600 inline-block flex-shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">
                Pilih Jalur Percabangan Decision
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Garis alur yang akan ditarik dari simbol <strong>Keputusan (Decision)</strong> ini merupakan
              jalur untuk kondisi apa?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleConfirmBranch("YA")}
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-bold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
              >
                <span className="text-xl">✅</span>
                <span className="text-emerald-800">Jalur YA</span>
                <span className="text-[10px] text-emerald-600 font-normal">(Kondisi Benar)</span>
              </button>

              <button
                onClick={() => handleConfirmBranch("TIDAK")}
                className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-400 text-rose-950 font-bold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
              >
                <span className="text-xl">❌</span>
                <span className="text-rose-800">Jalur TIDAK</span>
                <span className="text-[10px] text-rose-600 font-normal">(Kondisi Salah)</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setShowBranchModal(false);
                  setPendingSourceId(null);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
