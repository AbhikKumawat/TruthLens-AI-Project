"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Server,
  Key,
  Layers,
  ArrowUpRight,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Terminal,
  ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid,
  Cell
} from "recharts";

interface AnalysisItem {
  id: string;
  filename: string;
  status: string;
  prediction: string;
  trust_score: number;
  confidence: number;
  risk_level: string;
  created_at: string;
}

interface Distribution {
  [key: string]: number;
}

interface TrendItem {
  date: string;
  scanned: number;
  ai_detected: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    total_scanned: 0,
    average_trust_score: 100,
    high_risk_count: 0,
    queue_size: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [distribution, setDistribution] = useState<Distribution>({});
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<"online" | "offline">("online");
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = "http://localhost:8000";

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          total_scanned: data.total_scanned,
          average_trust_score: data.average_trust_score,
          high_risk_count: data.high_risk_count,
          queue_size: data.queue_size
        });
        setRecentAnalyses(data.recent_analyses || []);
        setDistribution(data.trust_distribution || {});
        setTrends(data.daily_trends || []);
        setAuditLogs(data.audit_logs || []);
        setServerStatus("online");
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.warn("Backend down. Loading client-side dashboard database.");
      setServerStatus("offline");
      loadOfflineDashboardData();
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineDashboardData = () => {
    // Read from LocalStorage history
    const storedHistory = localStorage.getItem("truthlens_history");
    const historyList: AnalysisItem[] = storedHistory ? JSON.parse(storedHistory) : [];

    // Combine with some standard historical defaults
    const defaultMocks = [
      { id: "mock-analysis-1", filename: "president_speech_deepfake.mp4", status: "completed", prediction: "AI-Generated", trust_score: 14.5, confidence: 0.942, risk_level: "High", created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: "mock-analysis-2", filename: "news_anchor_interview.mp4", status: "completed", prediction: "Authentic", trust_score: 94.8, confidence: 0.948, risk_level: "Low", created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: "mock-analysis-3", filename: "celebrity_endorsement_synth.mp4", status: "completed", prediction: "AI-Generated", trust_score: 32.1, confidence: 0.895, risk_level: "High", created_at: new Date(Date.now() - 14400000).toISOString() },
      { id: "mock-analysis-4", filename: "factcheck_wildfire_clip.mp4", status: "completed", prediction: "Authentic", trust_score: 88.2, confidence: 0.882, risk_level: "Low", created_at: new Date(Date.now() - 28800000).toISOString() },
      { id: "mock-analysis-5", filename: "political_debate_manipulated.mp4", status: "completed", prediction: "AI-Generated", trust_score: 25.4, confidence: 0.912, risk_level: "High", created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: "mock-analysis-6", filename: "spacex_launch_original.mp4", status: "completed", prediction: "Authentic", trust_score: 97.5, confidence: 0.975, risk_level: "Low", created_at: new Date(Date.now() - 172800000).toISOString() }
    ];

    // Deduplicate lists
    const combined = [...historyList];
    defaultMocks.forEach(mock => {
      if (!combined.some(item => item.id === mock.id)) {
        combined.push(mock);
      }
    });

    // Compute stats
    const total = combined.length;
    const completed = combined.filter(x => x.status === "completed");
    const avgTrust = completed.length > 0 
      ? Math.round(completed.reduce((acc, curr) => acc + curr.trust_score, 0) / completed.length * 10) / 10 
      : 100;
    const highRisk = completed.filter(x => x.risk_level === "High").length;
    const queuedCount = combined.filter(x => x.status === "queued" || x.status === "processing").length;

    setStats({
      total_scanned: total,
      average_trust_score: avgTrust,
      high_risk_count: highRisk,
      queue_size: queuedCount
    });

    setRecentAnalyses(combined);

    // Distribution
    const dist = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    completed.forEach(item => {
      const score = item.trust_score;
      if (score <= 20) dist["0-20"] += 1;
      else if (score <= 40) dist["21-40"] += 1;
      else if (score <= 60) dist["41-60"] += 1;
      else if (score <= 80) dist["61-80"] += 1;
      else dist["81-100"] += 1;
    });
    setDistribution(dist);

    // Daily trends (7 days simulation)
    const trendsData: TrendItem[] = [];
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      const dateStr = new Date(now.getTime() - (6 - d) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const itemsForDay = completed.filter(x => x.created_at.startsWith(dateStr));
      
      trendsData.push({
        date: dateStr,
        scanned: itemsForDay.length > 0 ? itemsForDay.length : (3 + d) % 6,
        ai_detected: itemsForDay.length > 0 
          ? itemsForDay.filter(x => x.prediction === "AI-Generated").length 
          : ((3 + d) % 6) > 2 ? 1 : 0
      });
    }
    setTrends(trendsData);

    // Audit logs
    const logs: AuditLog[] = combined.map((item, idx) => ({
      id: `audit-${idx}`,
      timestamp: item.created_at,
      event: "Analysis Finalized",
      actor: "API_Key_Test_Demo",
      details: `Scanned video ${item.filename} - Verdict: ${item.prediction} (Trust Score: ${item.trust_score}%)`
    }));
    setAuditLogs(logs);
  };

  // Convert distribution map to chart format
  const distributionChartData = Object.keys(distribution).map(key => ({
    range: key,
    count: distribution[key]
  }));

  // Filter recent analyses by search keyword
  const filteredAnalyses = recentAnalyses.filter(a => 
    a.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 w-full flex-1">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-200">Enterprise Safety Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Platform moderation logs, live processing queues, and synthetic threat signatures.</p>
        </div>

        <div className="flex items-center gap-3">
          {serverStatus === "offline" && (
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Offline Simulation
            </span>
          )}
          <button
            onClick={fetchDashboardStats}
            className="p-2.5 hover:bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh stats"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          <Link
            href="/portal"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" /> Launch Scan Portal
          </Link>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Scanned Card */}
        <div className="glass-panel rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Scanned</span>
            <span className="text-2xl font-black font-mono">{stats.total_scanned}</span>
            <span className="text-[9px] text-slate-400">All media uploads</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Trust Score Card */}
        <div className="glass-panel rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Trust</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{stats.average_trust_score}%</span>
            <span className="text-[9px] text-slate-400">Target baseline &gt; 70%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* High Risk Card */}
        <div className="glass-panel rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">High Risk flagged</span>
            <span className="text-2xl font-black font-mono text-rose-400">{stats.high_risk_count}</span>
            <span className="text-[9px] text-slate-400">Flagged synthetic fakes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Queue Size Card */}
        <div className="glass-panel rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Queue Size</span>
            <span className="text-2xl font-black font-mono">{stats.queue_size}</span>
            <span className="text-[9px] text-slate-400">Active worker processes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid: 2 Charts */}
      {mounted && (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Trust Distribution Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Trust Score Distribution</h2>
              <p className="text-[10px] text-slate-400">Grouped counts of completed media scans.</p>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionChartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#6366f1', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {distributionChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.range === "0-20" || entry.range === "21-40" ? "#f43f5e" : "#4f46e5"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Scans Trends Line Chart */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-500 tracking-wider">7-Day Threat Activity</h2>
              <p className="text-[10px] text-slate-400">Ingested volume vs flagged AI manipulations.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="scanned" stroke="#14b8a6" strokeWidth={2.5} name="Total Scanned" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="ai_detected" stroke="#ef4444" strokeWidth={2.5} name="AI Detected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Recent Analyses & Search Log */}
      <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-200">Scanned Archive Log</h2>
            <p className="text-[10px] text-slate-400">Searchable list of all historic evaluations.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search filename or verdict..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none w-64 pr-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-white/5 rounded-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-3">File Name</th>
                <th className="p-3">Analysis ID</th>
                <th className="p-3">Verdict</th>
                <th className="p-3">Trust Score</th>
                <th className="p-3">Timestamped</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                filteredAnalyses.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-200 truncate max-w-[200px]">{a.filename}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{a.id.substring(0, 8)}...</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.prediction === "Authentic"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {a.prediction}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-300">{a.trust_score}%</td>
                    <td className="p-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/portal/result/${a.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      >
                        Inspect <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail & API Access Key Mock Controls */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Security Audit Trail */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border-white/5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold">Platform Security Audit Log</h2>
            <p className="text-[10px] text-slate-400">Read-only immutable trace of platform activity.</p>
          </div>

          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 border border-white/5 bg-slate-900/10 rounded-xl flex items-start gap-3 text-[11px] leading-relaxed">
                <Terminal className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-mono text-[9px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-400">{log.event}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  <span className="text-[9px] text-indigo-400 font-mono mt-1 block">Actor: {log.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Access Keys & Configuration Panel */}
        <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between gap-6 h-fit">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5"><Key className="w-4 h-4 text-indigo-400" /> API Access Keys</h2>
              <p className="text-[10px] text-slate-400">Generate secure credentials for automation integrations.</p>
            </div>

            <div className="border border-white/5 rounded-xl p-3 bg-slate-950">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">PRODUCTION SECRET KEY</span>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="font-mono text-slate-300">tl_prod_live_•••••••••</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => alert("API key rotation requires an enterprise safety manager clearance.")}
              className="w-full text-center py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-98"
            >
              Rotate Secret Key
            </button>
            <Link
              href="http://localhost:8000/docs"
              target="_blank"
              className="w-full text-center py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-xs font-semibold text-white transition-all active:scale-98 flex items-center justify-center gap-1"
            >
              API Reference Docs <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
