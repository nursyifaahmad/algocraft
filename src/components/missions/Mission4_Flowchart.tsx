"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Move,
  FileQuestion,
  X,
  HelpCircle,
} from "lucide-react";

interface CanvasNode {
  id: string;
  itemId: string; // ID dari FLOWCHART_ITEMS
  chosenType: "terminator" | "io" | "process" | "decision"; // Bentuk yang DIPILIH siswa
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

export const Mission4_Flowchart: React.FC<Mission4Props> = ({ onSuccess, onWrongAttempt }) => {
  // Kanvas kertas kosong murni (tanpa kisi-kisi jawaban/slot pola)
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Dialog pembuatan simbol baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedShapeTool, setSelectedShapeTool] = useState<
    "terminator" | "io" | "process" | "decision" | null
  >(null);
  const [selectedTextId, setSelectedTextId] = useState<string>("");

  // Interaksi node & koneksi
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [branchChoice, setBranchChoice] = useState<"YA" | "TIDAK" | null>(null);

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

    // Tentukan posisi awal di tengah kanvas
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const spawnX = canvasBounds ? Math.min(300, canvasBounds.width / 2 - 90) : 180;
    const spawnY = 40 + (nodes.length % 5) * 80;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      itemId: targetItem.id,
      chosenType: selectedShapeTool, // Bentuk yang dipilih oleh nalar murid sendiri
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

  // 2. Hubungkan dua simbol dengan garis alur panah
  const handleNodeClick = (nodeId: string) => {
    if (submitted) return;

    if (connectingSourceId) {
      if (connectingSourceId === nodeId) {
        setConnectingSourceId(null);
        setBranchChoice(null);
        return;
      }

      // Buat koneksi baru
      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        fromId: connectingSourceId,
        toId: nodeId,
        label: branchChoice || undefined,
      };

      setConnections((prev) => [...prev, newConn]);
      setConnectingSourceId(null);
      setBranchChoice(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const handleStartConnect = (nodeId: string) => {
    const sourceNode = nodes.find((n) => n.id === nodeId);
    if (sourceNode?.chosenType === "decision") {
      // Jika dari Decision, tanyakan cabang YA atau TIDAK
      const existingBranch = connections.filter((c) => c.fromId === nodeId);
      if (existingBranch.some((c) => c.label === "YA")) {
        setBranchChoice("TIDAK");
      } else {
        setBranchChoice("YA");
      }
    } else {
      setBranchChoice(null);
    }
    setConnectingSourceId(nodeId);
  };

  // 3. Dragging node di atas kertas kosong
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

    const newX = Math.max(10, Math.min(canvasRect.width - 200, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 70, e.clientY - canvasRect.top - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Touch Events untuk Layar HP Android/iOS
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

    const newX = Math.max(10, Math.min(canvasRect.width - 200, touch.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 70, touch.clientY - canvasRect.top - dragOffset.y));

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

  const handleReset = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setConnectingSourceId(null);
    setSubmitted(false);
    setResult(null);
  };

  // 4. Validasi Autentik Flowchart
  const handleSubmit = () => {
    const errors: string[] = [];
    let correctSymbolsCount = 0;

    // Evaluasi 1: Apakah siswa memilih bentuk simbol yang benar untuk setiap instruksi?
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

    // Evaluasi 2: Apakah koneksi alurnya sudah mengalir dari Mulai ke Selesai dengan cabang percabangan?
    let validConnectionsCount = 0;
    const startNode = nodes.find((n) => n.itemId === "fc-start");
    const endNode = nodes.find((n) => n.itemId === "fc-end");
    const decisionNode = nodes.find((n) => n.itemId === "fc-decision");

    // Cek koneksi dari start
    if (startNode && connections.some((c) => c.fromId === startNode.id)) {
      validConnectionsCount += 1;
    }
    // Cek koneksi ke end
    if (endNode && connections.some((c) => c.toId === endNode.id)) {
      validConnectionsCount += 1;
    }
    // Cek cabang Decision YA & TIDAK
    if (decisionNode) {
      const hasYa = connections.some((c) => c.fromId === decisionNode.id && c.label === "YA");
      const hasTidak = connections.some((c) => c.fromId === decisionNode.id && c.label === "TIDAK");
      if (hasYa) validConnectionsCount += 1;
      else errors.push("Cabang [YA] dari simbol Decision (Belah Ketupat) belum dihubungkan.");
      if (hasTidak) validConnectionsCount += 1;
      else errors.push("Cabang [TIDAK] dari simbol Decision (Belah Ketupat) belum dihubungkan.");
    }

    const totalExpectedSymbols = FLOWCHART_ITEMS.length; // 7

    // Rubrik Skala 4 Asesmen PPG
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

  return (
    <div className="space-y-5">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Misi 4: Desain Diagram Alir Mandiri (Kertas Gambar Kosong)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Rancanglah diagram alir algoritma kasir kantin di atas <strong>kertas kosong</strong>. Pilih
          bentuk simbol yang sesuai kaidah ilmu komputer untuk setiap instruksi, atur posisinya secara
          bebas, dan hubungkan garis alurnya beserta percabangan <strong>YA / TIDAK</strong>.
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• Tidak ada kisi/pola bantuan. Uji pemahaman simbolik Anda secara murni!</span>
        </div>
      </div>

      {/* Toolbar Kertas Gambar (Alat Simbol) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-1">Alat Gambar Simbol:</span>

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
          <span className="text-slate-500">
            Simbol di Kertas: <strong>{nodes.length}</strong>/7 | Garis:{" "}
            <strong>{connections.length}</strong>
          </span>
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
        className="relative w-full h-[620px] bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-inner select-none"
      >
        {/* Pesan Kertas Kosong jika belum ada simbol */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Kertas Diagram Alir Kosong</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Gunakan tombol di atas untuk memilih bentuk simbol (Terminator, I/O, Proses, Decision)
              dan masukkan teks instruksi algoritma kantin ke dalamnya.
            </p>
          </div>
        )}

        {/* Petunjuk saat Menarik Garis Panah */}
        {connectingSourceId && (
          <div className="absolute top-4 left-4 z-20 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg animate-bounce flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>
              Ketuk simbol tujuan untuk menghubungkan garis alur
              {branchChoice ? ` (Cabang ${branchChoice})` : ""}
            </span>
            <button
              onClick={() => {
                setConnectingSourceId(null);
                setBranchChoice(null);
              }}
              className="ml-2 hover:bg-amber-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SVG Render Garis Panah Antar Simbol */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrowhead-flow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#334155" />
            </marker>
          </defs>

          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromId);
            const toNode = nodes.find((n) => n.id === conn.toId);
            if (!fromNode || !toNode) return null;

            // Titik tengah node
            const fromCenterX = fromNode.x + 95;
            const fromCenterY = fromNode.y + (fromNode.chosenType === "decision" ? 40 : 26);
            const toCenterX = toNode.x + 95;
            const toCenterY = toNode.y + (toNode.chosenType === "decision" ? 40 : 26);

            // Garis lurus / kurva
            const midX = (fromCenterX + toCenterX) / 2;
            const midY = (fromCenterY + toCenterY) / 2;

            return (
              <g key={conn.id}>
                <line
                  x1={fromCenterX}
                  y1={fromCenterY}
                  x2={toCenterX}
                  y2={toCenterY}
                  stroke="#334155"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowhead-flow)"
                />
                {conn.label && (
                  <text
                    x={midX}
                    y={midY - 6}
                    fill={conn.label === "YA" ? "#059669" : "#dc2626"}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-white"
                  >
                    [{conn.label}]
                  </text>
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
                isSource ? "ring-4 ring-amber-400 ring-offset-2" : isSelected ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              {/* 1. TERMINATOR (OVAL) */}
              {node.chosenType === "terminator" && (
                <div className="relative w-[190px] h-[48px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 190 48" preserveAspectRatio="none">
                    <rect x="2" y="2" width="186" height="44" rx="22" ry="22" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-4 text-center font-bold text-xs text-emerald-950">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 2. INPUT / OUTPUT (JAJAR GENJANG MIRING) */}
              {node.chosenType === "io" && (
                <div className="relative w-[210px] h-[52px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 52" preserveAspectRatio="none">
                    <polygon points="18,2 208,2 192,50 2,50" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-6 text-center font-semibold text-[11px] leading-tight text-sky-950">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 3. PROSES (PERSEGI PANJANG SIKU-SIKU) */}
              {node.chosenType === "process" && (
                <div className="relative w-[210px] h-[52px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 52" preserveAspectRatio="none">
                    <rect x="2" y="2" width="206" height="48" rx="0" ry="0" fill="#eef2ff" stroke="#4f46e5" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-3 text-center font-mono font-semibold text-[11px] leading-tight text-indigo-950">
                    {node.label}
                  </span>
                </div>
              )}

              {/* 4. DECISION (BELAH KETUPAT / DIAMOND) */}
              {node.chosenType === "decision" && (
                <div className="relative w-[210px] h-[80px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 80" preserveAspectRatio="none">
                    <polygon points="105,2 208,40 105,78 2,40" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" />
                  </svg>
                  <span className="relative z-10 px-8 text-center font-bold text-[11px] leading-tight text-amber-950">
                    {node.label}
                  </span>
                </div>
              )}

              {/* Floating Action Menu untuk node yang sedang dipilih */}
              {isSelected && !submitted && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-lg text-[10px] z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartConnect(node.id);
                    }}
                    className="flex items-center gap-1 hover:text-amber-400 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Tarik Panah ➔</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="hover:text-rose-400 p-0.5 rounded cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Geser simbol untuk menata bagan alir dan hubungkan panah dari Mulai ke Selesai.
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

      {/* Modal Dialog: Memilih Teks Instruksi untuk Bentuk yang Dipilih Murid */}
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
    </div>
  );
};
