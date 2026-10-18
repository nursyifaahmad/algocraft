"use client";

import React, { useState, useRef } from "react";
import { FLOWCHART_ITEMS, FlowchartNodeData } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Trash2,
  Network,
  Share2,
} from "lucide-react";

interface PlacedNode {
  id: string;
  originalId: string;
  type: "terminator" | "io" | "process" | "decision";
  label: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string; // "Ya" | "Tidak"
}

interface Mission4Props {
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission4_Flowchart: React.FC<Mission4Props> = ({ onSuccess, onWrongAttempt }) => {
  // Pre-load beberapa node awal agar siswa di HP tidak lelah menyusun dari nol
  const [nodes, setNodes] = useState<PlacedNode[]>([
    { id: "n-start", originalId: "fc-start", type: "terminator", label: "MULAI", x: 180, y: 30 },
    { id: "n-input", originalId: "fc-input", type: "io", label: "INPUT pesanan, total, saldo", x: 180, y: 120 },
    { id: "n-decision", originalId: "fc-decision", type: "decision", label: "saldo >= total?", x: 180, y: 220 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: "c-1", fromId: "n-start", toId: "n-input" },
    { id: "c-2", fromId: "n-input", toId: "n-decision" },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    rubricScore: number;
    percentage: number;
    isPass: boolean;
    feedback: string;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Tambah simbol baru ke kanvas
  const handleAddSymbol = (item: FlowchartNodeData) => {
    if (submitted) return;
    const exists = nodes.some((n) => n.originalId === item.id);
    if (exists) return;

    const newNode: PlacedNode = {
      id: `node-${Date.now()}`,
      originalId: item.id,
      type: item.type,
      label: item.label,
      x: 180,
      y: 100 + nodes.length * 80,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // Tap node untuk connect atau select
  const handleNodeClick = (nodeId: string) => {
    if (submitted) return;

    if (connectSourceId) {
      if (connectSourceId !== nodeId) {
        // Hubungkan dua node
        const sourceNode = nodes.find((n) => n.id === connectSourceId);
        let branchLabel: string | undefined = undefined;
        if (sourceNode?.type === "decision") {
          // Jika dari decision, cek apakah sudah ada cabang Ya/Tidak
          const existingFromDecision = connections.filter((c) => c.fromId === connectSourceId);
          branchLabel = existingFromDecision.length === 0 ? "Ya" : "Tidak";
        }

        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          fromId: connectSourceId,
          toId: nodeId,
          label: branchLabel,
        };
        setConnections((prev) => [...prev, newConn]);
      }
      setConnectSourceId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const handleStartConnect = (nodeId: string) => {
    setConnectSourceId(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleDeleteSelected = () => {
    if (!selectedNodeId || submitted) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromId !== selectedNodeId && c.toId !== selectedNodeId)
    );
    setSelectedNodeId(null);
    setConnectSourceId(null);
  };

  const handleReset = () => {
    setNodes([
      { id: "n-start", originalId: "fc-start", type: "terminator", label: "MULAI", x: 180, y: 30 },
      { id: "n-input", originalId: "fc-input", type: "io", label: "INPUT pesanan, total, saldo", x: 180, y: 120 },
      { id: "n-decision", originalId: "fc-decision", type: "decision", label: "saldo >= total?", x: 180, y: 220 },
    ]);
    setConnections([
      { id: "c-1", fromId: "n-start", toId: "n-input" },
      { id: "c-2", fromId: "n-input", toId: "n-decision" },
    ]);
    setSelectedNodeId(null);
    setConnectSourceId(null);
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = () => {
    // Validasi kelengkapan diagram:
    // 1. Memiliki terminator MULAI dan SELESAI
    const hasStart = nodes.some((n) => n.originalId === "fc-start");
    const hasEnd = nodes.some((n) => n.originalId === "fc-end");
    const hasDecision = nodes.some((n) => n.originalId === "fc-decision");
    const hasProcess = nodes.some((n) => n.originalId === "fc-process-yes");
    const hasOutputs = nodes.some((n) => n.originalId === "fc-output-yes");

    // 2. Minimal memiliki 5 koneksi yang menghubungkan alur
    const connectionCount = connections.length;

    let rubricScore = 1;
    let feedback = "";

    if (hasStart && hasEnd && hasDecision && hasProcess && hasOutputs && connectionCount >= 5) {
      rubricScore = 4;
      feedback = "Luar biasa! Seluruh simbol dan alur flowchart tersusun lengkap dan valid.";
    } else if (hasStart && hasEnd && hasDecision && connectionCount >= 4) {
      rubricScore = 3;
      feedback = "Bagus! Diagram alir sudah memuat percabangan dan alur utama secara logis.";
    } else if (hasStart && (hasDecision || hasProcess)) {
      rubricScore = 2;
      feedback = "Cukup, namun diagram alir belum selesai sampai ke Terminator SELESAI.";
    } else {
      rubricScore = 1;
      feedback = "Bagan alir belum lengkap. Pastikan menghubungkan simbol dari MULAI ke SELESAI.";
    }

    const percentage = rubricScore === 4 ? 100 : rubricScore === 3 ? 80 : rubricScore === 2 ? 60 : 40;
    const isPass = rubricScore >= 3; // Kriteria TP 4: minimal skor 3 dari 4

    setResult({
      rubricScore,
      percentage,
      isPass,
      feedback,
    });
    setSubmitted(true);

    if (isPass) {
      onSuccess(percentage, rubricScore, { nodes, connections });
    } else {
      onWrongAttempt();
    }
  };

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
          <Network className="w-4 h-4 text-amber-600" />
          <span>Misi 4: Arsitektur Alur Sistem (Flowchart Bebas Responsif)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Gambarkan alur logika transaksi kasir kantin menggunakan simbol diagram alir standar.
          Tambahkan simbol yang diperlukan ke kanvas, lalu hubungkan dengan panah alur keputusan!
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• Tambah simbol dari palet, lalu ketuk &quot;Hubungkan&quot; untuk menarik panah.</span>
        </div>
      </div>

      {/* Toolbar Palet Simbol */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>PALET SIMBOL TERSEDIA:</span>
          <span className="text-[10px] text-slate-400">Ketuk untuk menambah ke kanvas</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {FLOWCHART_ITEMS.map((item) => {
            const isAdded = nodes.some((n) => n.originalId === item.id);
            return (
              <button
                key={item.id}
                disabled={isAdded || submitted}
                onClick={() => handleAddSymbol(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAdded
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-amber-400 hover:shadow-xs"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[180px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Area Kanvas Diagram Alir */}
      <div className="relative border-2 border-slate-300 rounded-3xl bg-slate-900/5 overflow-hidden shadow-inner min-h-[460px]">
        {/* Floating Canvas Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {selectedNodeId && !submitted && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 cursor-pointer border-l border-slate-200 ml-1"
              title="Hapus Simbol Terpilih"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Petunjuk Koneksi */}
        {connectSourceId && (
          <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md animate-bounce flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Ketuk simbol tujuan untuk menghubungkan garis panah</span>
          </div>
        )}

        {/* Kanvas Interaktif (SVG + Nodes) */}
        <div
          ref={canvasRef}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
          className="relative w-full h-[620px] transition-transform duration-150 p-6 flex flex-col items-center"
        >
          {/* SVG Garis Panah Koneksi */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromId);
              const toNode = nodes.find((n) => n.id === conn.toId);
              if (!fromNode || !toNode) return null;

              // Hitung titik tengah vertikal sederhana
              const fromIndex = nodes.indexOf(fromNode);
              const toIndex = nodes.indexOf(toNode);
              const startY = 40 + fromIndex * 85;
              const endY = 20 + toIndex * 85;

              return (
                <g key={conn.id}>
                  <line
                    x1="50%"
                    y1={startY}
                    x2="50%"
                    y2={endY}
                    stroke="#475569"
                    strokeWidth="2.5"
                    strokeDasharray={fromNode.type === "decision" ? "4" : undefined}
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text
                      x="52%"
                      y={(startY + endY) / 2}
                      fill="#b45309"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      [{conn.label}]
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Render Nodes Terpasang */}
          <div className="space-y-6 w-full max-w-sm z-10">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isSource = connectSourceId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className={`p-3 text-center cursor-pointer transition-all shadow-sm select-none relative ${
                    isSource
                      ? "ring-4 ring-amber-400 scale-105"
                      : isSelected
                      ? "ring-2 ring-indigo-500 scale-102"
                      : "hover:shadow-md"
                  } ${
                    node.type === "terminator"
                      ? "rounded-full bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 max-w-[200px] mx-auto border-2 border-emerald-400"
                      : node.type === "decision"
                      ? "bg-amber-100 text-amber-950 font-bold text-xs p-4 border-2 border-amber-400 rotate-0 rounded-2xl"
                      : node.type === "io"
                      ? "bg-sky-100 text-sky-950 font-semibold text-xs p-3.5 border-2 border-sky-400 rounded-xl"
                      : "bg-indigo-100 text-indigo-950 font-semibold text-xs p-3.5 border-2 border-indigo-400 rounded-xl"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase opacity-70">
                      {node.type === "terminator"
                        ? "Terminator"
                        : node.type === "decision"
                        ? "Decision (IF)"
                        : node.type === "io"
                        ? "Input/Output"
                        : "Process"}
                    </span>
                    {!submitted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnect(node.id);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 hover:bg-white text-slate-800 font-bold shadow-xs cursor-pointer"
                        title="Tarik panah dari node ini"
                      >
                        Hubungkan ➔
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm">{node.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Simbol terpasang: {nodes.length} | Koneksi panah: {connections.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Bagan Alir Valid! Skor Rubrik: {result.rubricScore}/4 ({result.percentage}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Skor Rubrik: {result?.rubricScore}/4. {result?.feedback}</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi Diagram
                </button>
              </div>
            )
          ) : (
            <button
              disabled={nodes.length < 4}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Validasi Diagram Alir</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
