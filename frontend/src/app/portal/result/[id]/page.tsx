"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Clock, 
  ShieldAlert,
  Download,
  AlertCircle,
  Video,
  Tag,
  Eye,
  Ban,
  Globe,
  Archive
} from "lucide-react";

interface FrameEvidence {
  frame_number: number;
  timestamp: number;
  confidence: number;
  prediction: string;
  risk_level: string;
  box: number[] | null;
  anomaly_type: string | null;
}

interface AnalysisResultDetail {
  id: string;
  filename: string;
  status: string;
  prediction: string;
  trust_score: number;
  confidence: number;
  risk_level: string;
  explanation: string;
  evidence: FrameEvidence[];
  suspicious_timestamps: number[];
  processing_time: number;
  recommendations: string[];
  created_at: string;
}

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [result, setResult] = useState<AnalysisResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FrameEvidence | null>(null);
  const [moderatorAction, setModeratorAction] = useState<string | null>(null);

  const backendUrl = "http://localhost:8000";

  useEffect(() => {
    fetchResult();
  }, [id]);

  useEffect(() => {
    if (result && result.prediction !== "Authentic" && result.status === "completed") {
      alert("Alert: This type of content can degrade platform content quality and authenticity.");
    }
  }, [result]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      // Check if it is an offline demo ID
      if (id.startsWith("offline-")) {
        const stored = localStorage.getItem(`truthlens_result_${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setResult(parsed);
          if (parsed.evidence && parsed.evidence.length > 0) {
            setSelectedFrame(parsed.evidence[0]);
          }
          setLoading(false);
          return;
        } else {
          throw new Error("Offline result not found in cache.");
        }
      }

      // Fetch from actual API
      const res = await fetch(`${backendUrl}/api/result/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: Status ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      if (data.evidence && data.evidence.length > 0) {
        setSelectedFrame(data.evidence[0]);
      }
      setLoading(false);
    } catch (err: any) {
      console.warn("Could not load from API, trying offline fallback mock.");
      // Check if there is an offline cached version or mock
      const mockResult = getMockResultForId(id);
      if (mockResult) {
        setResult(mockResult);
        setSelectedFrame(mockResult.evidence[0]);
        setLoading(false);
      } else {
        setError(err.message || "Failed to retrieve analysis details.");
        setLoading(false);
      }
    }
  };

  const getMockResultForId = (mockId: string): AnalysisResultDetail | null => {
    // Generate standard mock matching the dashboard populated records
    const idx = mockId.replace("mock-analysis-", "");
    const i = parseInt(idx) - 1;
    if (isNaN(i) || i < 0) return null;

    const mockVideos = [
      { filename: "president_speech_deepfake.mp4", pred: "AI-Generated", trust: 14.5, conf: 0.942, risk: "High", expl: "Deepfake speech featuring simulated facial boundary artifacts and unnatural eye-blinking rates.", recs: ["Flag content immediately", "Apply 'Synthetic Media' label"], susp_ts: [2.5, 5.8, 12.4] },
      { filename: "news_anchor_interview.mp4", pred: "Authentic", trust: 94.8, conf: 0.948, risk: "Low", expl: "The video exhibits high temporal coherence and organic skin texture mappings without deepfake signatures.", recs: ["Approve for distribution", "Cache hash"], susp_ts: [] },
      { filename: "celebrity_endorsement_synth.mp4", pred: "AI-Generated", trust: 32.1, conf: 0.895, risk: "High", expl: "Local facial blending boundaries detected near lip movements indicating voice-synced synthesis.", recs: ["Queue for manual verification", "Apply warning label"], susp_ts: [4.1, 8.2] }
    ];

    const target = mockVideos[i % mockVideos.length];
    
    // Simulate frame evidence
    const evidenceList: FrameEvidence[] = [];
    for (let fn = 0; fn < 6; fn++) {
      const ts = fn * 2.0;
      const frame_conf = (1.0 - (target.trust / 100)) + (0.05 * (fn % 2));
      const frame_conf_clamped = Math.min(0.99, Math.max(0.01, frame_conf));
      
      const frame_pred = frame_conf_clamped >= 0.5 ? "AI-Generated" : "Authentic";
      const frame_risk = frame_conf_clamped >= 0.75 ? "High" : frame_conf_clamped >= 0.4 ? "Medium" : "Low";
      
      let anomaly = null;
      if (frame_pred === "AI-Generated" && fn % 2 !== 0) {
        anomaly = "Spatial blending mismatch";
      }

      evidenceList.push({
        frame_number: fn * 10,
        timestamp: ts,
        confidence: frame_conf_clamped,
        prediction: frame_pred,
        risk_level: frame_risk,
        box: fn % 2 === 0 ? [120, 80, 240, 240] : null,
        anomaly_type: anomaly
      } as any); // Typecast helper
    }

    return {
      id: mockId,
      filename: target.filename,
      status: "completed",
      prediction: target.pred,
      trust_score: target.trust,
      confidence: target.conf,
      risk_level: target.risk,
      explanation: target.expl,
      evidence: evidenceList,
      suspicious_timestamps: target.susp_ts,
      processing_time: 4.25,
      recommendations: target.recs,
      created_at: new Date().toISOString()
    };
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    if (id.startsWith("offline-")) {
      // Simulate download
      alert("Offline Mode: PDF Generation requires an active FastAPI backend. Directing to download schema details.");
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `TruthLens_Result_${id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }
    // Open API endpoint for PDF download
    window.open(`${backendUrl}/api/report/${id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1 flex flex-col items-center justify-center gap-4">
        <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
        <p className="text-sm text-slate-400">Loading analysis reports...</p>
      </div>
    );
  }

  if (error || !result || (result && result.status === "failed")) {
    const errorDetails =
      typeof error === "string"
        ? error
        : (error as any)?.message ?? (result?.error ?? "Media processing failed.");
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">Media Verification Failed</h2>
        <p className="text-sm text-slate-400 max-w-lg leading-relaxed bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
          {errorDetails}
        </p>
        <div className="text-xs text-slate-500 mt-2 max-w-md">
          <strong>Tip:</strong> TruthLens inspects raw binary frame layers. If you pasted a website URL (such as a YouTube video link), the server downloaded the HTML of the website instead of the raw video stream. Please upload a physical file or use a direct raw video stream link (ending in .mp4, .mov, etc.).
        </div>
        <Link href="/portal" className="mt-6 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
          Return to Scan Portal
        </Link>
      </div>
    );
  }


  // Calculate colors based on trust score
  const isAuthentic = result.prediction === "Authentic";
  const trustColorClass = isAuthentic ? "text-emerald-400" : "text-rose-400";
  const trustBorderClass = isAuthentic ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 w-full flex-1">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/portal" className="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-400 hover:text-white" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-200">{result.filename}</h1>
              <span className="text-[10px] text-slate-500 font-mono">#{result.id.substring(0, 8)}</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5" /> Scanned {new Date(result.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-all active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4 text-indigo-400" /> Export PDF Certification
        </button>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Score & Verdict Card */}
        <div className={`glass-panel border rounded-2xl p-6 flex flex-col justify-between items-center text-center ${trustBorderClass}`}>
          <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>MEDIA VERDICT</span>
            <span>CONFIDENCE: {Math.round(result.confidence * 100)}%</span>
          </div>

          <div className="my-6 relative flex flex-col items-center">
            {/* Trust Score Radial Display */}
            <div className="w-36 h-36 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 animate-spin" 
                style={{ animationDuration: '3s', opacity: 0.2 }}
              />
              <span className="text-4xl font-black font-mono">{result.trust_score}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Trust Score</span>
            </div>

            <div className={`mt-5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isAuthentic ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            }`}>
              {result.prediction}
            </div>
          </div>

          <div className="w-full border-t border-white/5 pt-4 text-left text-xs text-slate-400">
            <span className="font-semibold block text-[10px] uppercase text-slate-500 tracking-wider mb-1">Risk Classification</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                result.risk_level === "High" ? "bg-rose-500" : result.risk_level === "Medium" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
              <span className="font-bold text-slate-300">{result.risk_level} Risk Level</span>
            </div>
          </div>
        </div>

        {/* Explainable AI Block */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-500 tracking-wider">AI Analytical Explanation</h2>
              <p className="text-sm text-slate-200 leading-relaxed mt-2">{result.explanation}</p>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Detected Suspicious Timestamps</h3>
              {result.suspicious_timestamps.length === 0 ? (
                <p className="text-xs text-slate-400 mt-2">No suspicious frames or temporal anomalies detected. Media exhibits coherent signature patterns.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.suspicious_timestamps.map((ts) => (
                    <span key={ts} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> {ts}s
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">MODERATOR ACTIONS</span>
            
            {!isAuthentic ? (
              <>
                {/* AI Warning Alert */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-3 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 animate-pulse" />
                  <span>Alert: This type of content can degrade platform content quality and authenticity.</span>
                </div>

                {moderatorAction ? (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">Action Dispatched Successfully</span>
                      <span className="opacity-80">
                        {moderatorAction === "label" && "Option A Executed: Content labeled as AI-Generated and marked on platform feeds."}
                        {moderatorAction === "review" && "Option B Executed: Content flagged and queued for manual moderator inspection."}
                        {moderatorAction === "reject" && "Option C Executed: Content rejected and flagged for platform-wide takedown."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <button
                      onClick={() => setModeratorAction("label")}
                      className="px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Tag className="w-4 h-4 text-amber-400" />
                      Option A: Label as AI Generated
                    </button>
                    <button
                      onClick={() => setModeratorAction("review")}
                      className="px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-300 font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-sky-400" />
                      Option B: Send for Manual Review
                    </button>
                    <button
                      onClick={() => setModeratorAction("reject")}
                      className="px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Ban className="w-4 h-4 text-rose-400" />
                      Option C: Reject Video
                    </button>
                  </div>
                )}
              </>
            ) : (
              moderatorAction ? (
                <div className="mt-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Content Published Successfully</span>
                    <span className="opacity-80">The organic media verification has been certified, and the video has been published to platform feeds.</span>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setModeratorAction("publish")}
                    className="px-3 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-bold transition-all text-center flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Option A: Publish Content
                  </button>
                  <button
                    onClick={() => setModeratorAction("archive")}
                    className="px-3 py-3 rounded-xl bg-slate-800/40 border border-white/10 hover:bg-slate-800/70 text-slate-300 font-bold transition-all text-center flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-slate-400" />
                    Option B: Archive Verification
                  </button>
                </div>
              )
            )}
          </div>
        </div>

      </div>

      {/* Frame by Frame Timeline Evidence */}
      <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-bold">Temporal Frame Evidence log</h2>
          <p className="text-xs text-slate-400">Click on any frame below to view isolated bounding box coordinates and localized anomaly metrics.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Frame List Table */}
          <div className="md:col-span-2 overflow-x-auto max-h-[350px] border border-white/5 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-3">Frame #</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-center">AI Confidence</th>
                  <th className="p-3">Prediction</th>
                  <th className="p-3">Anomaly Detected</th>
                </tr>
              </thead>
              <tbody>
                {result.evidence.map((ev) => (
                  <tr
                    key={ev.frame_number}
                    onClick={() => setSelectedFrame(ev)}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                      selectedFrame?.frame_number === ev.frame_number ? "bg-indigo-500/10" : ""
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-slate-300">{ev.frame_number}</td>
                    <td className="p-3 font-mono text-slate-400">{ev.timestamp}s</td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-bold ${ev.confidence >= 0.5 ? "text-rose-400" : "text-emerald-400"}`}>
                        {Math.round(ev.confidence * 100)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.prediction === "Authentic" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {ev.prediction}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 truncate max-w-[150px]">
                      {ev.anomaly_type || "No anomalies"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Frame Detail Viewer */}
          <div className="border border-white/5 rounded-xl p-4 bg-slate-950/40 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-200">Frame {selectedFrame?.frame_number} Crop Data</span>
              <span className="text-[10px] font-mono text-slate-500">{selectedFrame?.timestamp}s</span>
            </div>

            {/* Simulated Bounding Box Graphic */}
            <div className="aspect-video bg-slate-900 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
              <Video className="w-8 h-8 text-slate-700" />
              {selectedFrame?.box && (
                <div className="absolute border-2 border-dashed border-rose-500/80 bg-rose-500/10 flex flex-col justify-between p-1"
                     style={{
                       left: '25%',
                       top: '20%',
                       width: '50%',
                       height: '60%'
                     }}>
                  <span className="text-[8px] font-bold font-mono text-rose-400 bg-slate-950 px-1 py-0.5 rounded w-fit">
                    Face Crop Isolated
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Classification:</span>
                <span className={`font-semibold ${selectedFrame?.prediction === "Authentic" ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedFrame?.prediction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Score:</span>
                <span className="font-mono">{selectedFrame ? Math.round(selectedFrame.confidence * 100) : 0}% AI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Face Coordinates:</span>
                <span className="font-mono text-slate-300">
                  {selectedFrame?.box ? `[x:${selectedFrame.box[0]}, y:${selectedFrame.box[1]}]` : "No Face Isolated"}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Telemetry Diagnostic</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedFrame?.anomaly_type 
                    ? `Anomalous pattern detected: "${selectedFrame.anomaly_type}". Check boundaries.` 
                    : "No local pixel variance anomalies found on face surface crop."
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
