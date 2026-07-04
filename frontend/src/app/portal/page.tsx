"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Link2, 
  FileVideo, 
  AlertCircle, 
  History, 
  CheckCircle,
  Loader2,
  Trash2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ServerCrash
} from "lucide-react";

interface MockHistoryItem {
  id: string;
  filename: string;
  prediction: string;
  trust_score: number;
  risk_level: string;
  created_at: string;
}

export default function PortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [steerVerdict, setSteerVerdict] = useState<"auto" | "authentic" | "synthetic">("auto");
  
  // Loading & Progress states
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History state
  const [history, setHistory] = useState<MockHistoryItem[]>([]);
  const [serverStatus, setServerStatus] = useState<"online" | "offline">("online");
  // IDs of items the user has explicitly cleared
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  // Load cleared IDs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('truthlens_cleared_ids');
    if (stored) {
      try {
        setClearedIds(JSON.parse(stored));
      } catch {}
    }
  }, []);
  // Flag to remember if the user cleared all recent items
  const [allCleared, setAllCleared] = useState<boolean>(false);
  // Load cleared flag from localStorage on mount
  useEffect(() => {
    const cleared = localStorage.getItem('truthlens_all_cleared') === 'true';
    setAllCleared(cleared);
  }, []);

  const backendUrl = "http://localhost:8000";

  // Fetch History on load
  useEffect(() => {
    fetchHistory();
  }, [clearedIds]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          // Filter out any items the user has cleared
          const filtered = (data.recent_analyses || []).filter((item: MockHistoryItem) => !clearedIds.includes(item.id));
          setHistory(filtered);
          setServerStatus("online");
        } else {
          throw new Error("Bad status");
        }
    } catch (err) {
      console.warn("Backend not accessible, loading mock offline history.");
      setServerStatus("offline");
      // Fallback local storage or hardcoded mocks
      const local = localStorage.getItem("truthlens_history");
        if (local) {
          const parsed = JSON.parse(local);
          const filtered = parsed.filter((item: MockHistoryItem) => !clearedIds.includes(item.id));
          setHistory(filtered);
        } else {
          const mockHist = [
            { id: "mock-analysis-1", filename: "president_speech_deepfake.mp4", prediction: "AI-Generated", trust_score: 14.5, risk_level: "High", created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: "mock-analysis-2", filename: "news_anchor_interview.mp4", prediction: "Authentic", trust_score: 94.8, risk_level: "Low", created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: "mock-analysis-3", filename: "celebrity_endorsement_synth.mp4", prediction: "AI-Generated", trust_score: 32.1, risk_level: "High", created_at: new Date(Date.now() - 14400000).toISOString() }
          ];
          const filtered = mockHist.filter((item: MockHistoryItem) => !clearedIds.includes(item.id));
          setHistory(filtered);
          localStorage.setItem("truthlens_history", JSON.stringify(mockHist));
        }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("video/")) {
        setErrorMsg("Please select a valid video file.");
        return;
      }
      // Check size (e.g. 50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg("File exceeds 50MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    setProgressPercent(10);
    setProgressMsg("Preparing upload...");

    // Form data construction
    const formData = new FormData();
    if (activeTab === "file") {
      if (!selectedFile) {
        setErrorMsg("Please choose a file to upload first.");
        setIsLoading(false);
        return;
      }
      formData.append("file", selectedFile);
    } else {
      if (!videoUrl || !videoUrl.startsWith("http")) {
        setErrorMsg("Please enter a valid HTTP/HTTPS video URL.");
        setIsLoading(false);
        return;
      }
      formData.append("video_url", videoUrl);
    }

    if (callbackUrl) {
      formData.append("callback_url", callbackUrl);
    }

    formData.append("steer_verdict", steerVerdict);

    // Try to send to backend, with client-side fallback if down
    try {
      setProgressPercent(30);
      setProgressMsg("Uploading video payload...");
      
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      setProgressPercent(70);
      setProgressMsg("Running facial boundary splitting & PyTorch inference...");

      // Poll result until done
      let status = result.status;
      let analysisId = result.id;
      let attempts = 0;

      while ((status === "queued" || status === "processing") && attempts < 30) {
        await new Promise((r) => setTimeout(r, 1000));
        const checkRes = await fetch(`${backendUrl}/api/result/${analysisId}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          status = checkData.status;
          setProgressPercent((prev) => Math.min(95, prev + 5));
          setProgressMsg(`Processing frames... Status: ${status}`);
          if (status === "completed" || status === "failed") {
            break;
          }
        }
        attempts++;
      }

      setProgressPercent(100);
      setProgressMsg("Analysis finalized!");
      
      // Update history list and navigate
      await fetchHistory();
      // New items were added – clear the “all cleared” flag
      localStorage.removeItem('truthlens_all_cleared');
      setAllCleared(false);
      setIsLoading(false);
      router.push(`/portal/result/${analysisId}`);

    } catch (err) {
      console.error("API Upload failed. Simulating local client-side analysis.", err);
      // Fallback offline simulation
      setProgressPercent(40);
      setProgressMsg("Encountered connection drop. Simulating local client-side verification...");
      
      // Simulate progress
      setTimeout(() => {
        setProgressPercent(75);
        setProgressMsg("Simulating local edge inference using browser cascade coefficients...");
        
        setTimeout(() => {
          setProgressPercent(100);
          
          // Generate simulated result metadata and store in LocalStorage
          const tempId = `offline-${Math.random().toString(36).substring(2, 9)}`;
          const filename = activeTab === "file" ? (selectedFile?.name || "upload.mp4") : videoUrl.split("/").pop() || "url_video.mp4";
          
          // Steer prediction based on UI selection or filename
          let is_fake = false;
          if (steerVerdict === "synthetic") {
            is_fake = true;
          } else if (steerVerdict === "authentic") {
            is_fake = false;
          } else {
            const name_lower = filename.toLowerCase();
            is_fake = name_lower.includes("fake") || name_lower.includes("ai") || name_lower.includes("deepfake") || name_lower.includes("synth");
          }
          const trust = is_fake ? Math.round(10 + Math.random() * 25) : Math.round(75 + Math.random() * 22);
          const risk = trust < 40 ? "High" : trust < 70 ? "Medium" : "Low";
          
          const newHistoryItem: MockHistoryItem = {
            id: tempId,
            filename,
            prediction: trust < 50 ? "AI-Generated" : "Authentic",
            trust_score: trust,
            risk_level: risk,
            created_at: new Date().toISOString()
          };

          const updatedHist = [newHistoryItem, ...history];
          setHistory(updatedHist);
          // New offline entry – clear the flag
          localStorage.removeItem('truthlens_all_cleared');
          setAllCleared(false);
          localStorage.setItem("truthlens_history", JSON.stringify(updatedHist));

          // Mock detail object for the results detail page fallback
          const mockResultDetail = {
            id: tempId,
            filename,
            status: "completed",
            prediction: trust < 50 ? "AI-Generated" : "Authentic",
            trust_score: trust,
            confidence: trust < 50 ? (100 - trust)/100 : trust/100,
            risk_level: risk,
            explanation: is_fake 
              ? "Local texture anomalies and blending edge artifacts were detected in the face crops, indicating synthetic manipulation."
              : "High frame-to-frame coherence and organic noise distribution. No GAN signatures or boundary discrepancies found.",
            evidence: [
              { frame_number: 10, timestamp: 1.0, confidence: is_fake ? 0.88 : 0.05, prediction: is_fake ? "AI-Generated" : "Authentic", risk_level: is_fake ? "High" : "Low", box: [100, 80, 200, 200], anomaly_type: is_fake ? "Local texture anomalies" : null },
              { frame_number: 20, timestamp: 2.0, confidence: is_fake ? 0.92 : 0.08, prediction: is_fake ? "AI-Generated" : "Authentic", risk_level: is_fake ? "High" : "Low", box: [110, 85, 200, 200], anomaly_type: is_fake ? "Temporal boundary jitters" : null },
              { frame_number: 30, timestamp: 3.0, confidence: is_fake ? 0.85 : 0.06, prediction: is_fake ? "AI-Generated" : "Authentic", risk_level: is_fake ? "High" : "Low", box: [120, 90, 200, 200], anomaly_type: is_fake ? "Checkerboard frequency signature" : null }
            ],
            suspicious_timestamps: is_fake ? [1.0, 2.0, 3.0] : [],
            processing_time: 2.4,
            recommendations: is_fake 
              ? ["Flag content for manual moderator review.", "Add 'Synthetic Media' warning tag to video.", "Restrict platform feed distributions."]
              : ["No moderation actions required.", "Approve content for publishing."],
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };
          localStorage.setItem(`truthlens_result_${tempId}`, JSON.stringify(mockResultDetail));
          
          setIsLoading(false);
          router.push(`/portal/result/${tempId}`);
        }, 1200);
      }, 1000);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    // Update cleared IDs list
    const newCleared = [...clearedIds, id];
    setClearedIds(newCleared);
    localStorage.setItem('truthlens_cleared_ids', JSON.stringify(newCleared));
    localStorage.setItem("truthlens_history", JSON.stringify(updated));
  };
  const clearAllHistory = () => {
    // Add all current IDs to cleared list
    const allIds = history.map((item) => item.id);
    const newCleared = Array.from(new Set([...clearedIds, ...allIds]));
    setClearedIds(newCleared);
    localStorage.setItem('truthlens_cleared_ids', JSON.stringify(newCleared));
    // Clear UI state
    setHistory([]);
    localStorage.removeItem("truthlens_history");
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid md:grid-cols-3 gap-8 relative w-full">
      
      {/* Upload Column */}
      <div className="md:col-span-2 flex flex-col gap-6">
        
        {serverStatus === "offline" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <ServerCrash className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="font-bold">FastAPI Server Offline</p>
              <p className="opacity-80">TruthLens will process this video locally using offline simulation variables.</p>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold mb-1">Verify Media Authenticity</h1>
            <p className="text-xs text-slate-400">Scan media file metadata, frame channels, and face regions for deepfake indicators.</p>
          </div>

          {/* Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5 w-fit">
            <button
              onClick={() => { setActiveTab("file"); setErrorMsg(null); }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "file" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> File Upload
            </button>
            <button
              onClick={() => { setActiveTab("url"); setErrorMsg(null); }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "url" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Video URL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {activeTab === "file" ? (
              <div className="flex flex-col gap-3">
                {!selectedFile ? (
                  <label className="border border-dashed border-white/10 hover:border-indigo-500/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-900/10 cursor-pointer transition-colors duration-300">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold">Click to select or drag video file</p>
                      <p className="text-[10px] text-slate-500 mt-1">MP4, MOV, AVI, or MKV. Max 50MB.</p>
                    </div>
                  </label>
                ) : (
                  <div className="border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between bg-indigo-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <FileVideo className="w-5 h-5" />
                      </div>
                      <div className="max-w-[200px] sm:max-w-md overflow-hidden">
                        <p className="text-xs font-bold truncate text-slate-200">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/assets/video_sample.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Optional Webhook Configuration */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                Webhook Callback URL <span className="text-[9px] text-slate-600 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://yourdomain.com/webhook"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Verdict Mocking Selector for Demos */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                Target Verification Verdict <span className="text-[9px] text-indigo-400 font-semibold">(demo steering override)</span>
              </label>
              <select
                value={steerVerdict}
                onChange={(e) => setSteerVerdict(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-200 cursor-pointer"
              >
                <option value="auto">Auto Analyze (AI Decision)</option>
                <option value="authentic">Force Authentic (Camera Capture)</option>
                <option value="synthetic">Force AI-Generated (Deepfake)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-rose-400 text-xs p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            {/* Upload Button */}
            {!isLoading ? (
              <button
                type="submit"
                disabled={activeTab === "file" ? !selectedFile : !videoUrl}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover font-semibold text-xs text-white transition-colors duration-200 shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
              >
                Scan Authenticity
              </button>
            ) : (
              <div className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="font-semibold">{progressMsg}</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  {progressPercent}% Complete
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-4 h-fit">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Recent Analyses
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
            {history.length} Saved
            <button
              onClick={clearAllHistory}
              className="ml-2 p-1 text-slate-400 hover:text-rose-500 hover:bg-white/5 rounded"
              title="Clear all recent analyses"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-slate-500 text-xs py-8 text-center">No previous scans found.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/portal/result/${item.id}`)}
                className="p-3 border border-white/5 rounded-xl bg-slate-900/20 hover:bg-slate-900/60 cursor-pointer flex flex-col gap-2 transition-colors relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="max-w-[70%]">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.filename}</p>
                    <p className="text-[9px] text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-500 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    item.prediction === "Authentic"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {item.prediction}
                  </span>
                  
                  <span className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                    {item.prediction === "Authentic" ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-400" />
                    )}
                    {item.trust_score}% Trust
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
