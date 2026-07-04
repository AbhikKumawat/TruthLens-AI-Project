"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  FileText, 
  Layers, 
  ChevronRight, 
  Database,
  ArrowRight, 
  HelpCircle, 
  ChevronDown,
  CheckCircle
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      title: "Deepfake Detection Engine",
      desc: "Uses state-of-the-art vision models to extract frames and isolate facial crops to verify biological coherence."
    },
    {
      icon: <Cpu className="w-6 h-6 text-primary" />,
      title: "Explainable AI Logs",
      desc: "Get readable reports detailing spatial edge anomalies, color spectrum anomalies, and frequency distortions."
    },
    {
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      title: "Verified PDF Certifications",
      desc: "Instantly compile trust scores, timestamps, frame verification logs, and safety actions into audit-ready PDFs."
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Batch API & Queueing",
      desc: "Process hours of video feeds concurrently. Queue via webhook alerts and automate platform moderations."
    },
    {
      icon: <Database className="w-6 h-6 text-amber-400" />,
      title: "Enterprise Trust Auditing",
      desc: "Track and log moderation overrides, score deviations, trust averages, and threat actor patterns."
    },
    {
      icon: <Zap className="w-6 h-6 text-pink-400" />,
      title: "Real-time Edge Integration",
      desc: "Developer-friendly REST API endpoints designed to deploy directly into publishing workflows."
    }
  ];

  const steps = [
    { num: "01", name: "Upload Video", desc: "Push media directly via portal or REST API URL endpoint." },
    { num: "02", name: "Temporal Splitting", desc: "OpenCV isolates frames and runs Haar face tracking cascades." },
    { num: "03", name: "Inference Stack", desc: "PyTorch CNN analyzes local face crops and frequency features." },
    { num: "04", name: "Trust Verdict", desc: "Risk Engine computes trust scores and generates PDF audits." }
  ];

  const faqs = [
    {
      q: "How does TruthLens AI detect deepfakes?",
      a: "TruthLens uses a combination of frame extraction and face isolation models. It analyzes local facial boundaries, texture anomalies, frequency-domain artifacts (like GAN-specific checkerboard patterns), and temporal inconsistencies across adjacent video frames to yield a trust verdict."
    },
    {
      q: "What is the difference between Trust Score and Confidence?",
      a: "The Trust Score (0-100%) represents the platform's assessment of a video's authenticity (higher means more likely to be authentic). The Confidence score (0.0-1.0) represents the neural network's mathematical certainty of its internal prediction, whether authentic or AI-generated."
    },
    {
      q: "Can this be integrated into our custom moderation queue?",
      a: "Yes. TruthLens was built developer-first. With our REST API and webhook system, you can submit batches of videos automatically and receive callback triggers as soon as the results and PDF certifications are ready, requiring zero manual polling."
    },
    {
      q: "How fast does the processing take?",
      a: "For standard 30-second clips, frame extraction and AI inference complete in less than 5 seconds. Larger files are processed asynchronously via our background queue so as not to block API clients."
    }
  ];

  return (
    <div className="flex flex-col w-full relative">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-96 h-96 rounded-full bg-accent/15 blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>Announcing TruthLens v1.0 Enterprise Edition</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Verify Media Authenticity with{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent glow-text-primary">
            AI Trust Guard
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          TruthLens is the enterprise trust and safety platform for detecting AI-generated videos, deepfakes, and synthetic manipulations in real time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/portal"
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 group active:scale-95"
          >
            Access User Portal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-sm transition-all backdrop-blur-md flex items-center gap-2 active:scale-95"
          >
            Enterprise Dashboard
          </Link>
        </div>

        {/* Hero Interactive Visualizer Mock */}
        <div className="mt-16 border border-white/10 rounded-2xl bg-slate-900/50 p-2 backdrop-blur-xl shadow-2xl shadow-black/80 max-w-5xl mx-auto overflow-hidden">
          <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950 flex flex-col md:flex-row aspect-video md:aspect-[21/9]">
            <div className="flex-1 bg-slate-900 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
              {/* Left View - Authentic */}
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')" }} />
              <div className="absolute top-4 left-4 px-2 py-1 rounded bg-success/20 border border-success/30 text-[10px] text-success font-bold uppercase tracking-wider">
                Original Frame
              </div>
              <div className="z-10 text-center p-6">
                <p className="text-sm font-semibold mb-1">Human Subject Alpha</p>
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 justify-center">
                  <CheckCircle className="w-3.5 h-3.5" /> High Trust (97.4%)
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
              {/* Right View - AI Manipulated */}
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')" }} />
              <div className="absolute top-4 left-4 px-2 py-1 rounded bg-danger/20 border border-danger/30 text-[10px] text-danger font-bold uppercase tracking-wider">
                Manipulated Frame
              </div>
              
              {/* Scan overlay simulation */}
              <div className="absolute inset-y-0 left-1/3 right-1/3 border-x border-dashed border-danger/40 bg-danger/5 animate-pulse" />
              <div className="absolute top-1/4 left-1/3 w-4 h-4 border-t-2 border-l-2 border-danger" />
              <div className="absolute bottom-1/4 right-1/3 w-4 h-4 border-b-2 border-r-2 border-danger" />

              <div className="z-10 text-center p-6">
                <p className="text-sm font-semibold mb-1">Facial Crop Region</p>
                <p className="text-[11px] text-rose-500 font-mono">Boundary Delta Triggered: 91.2% AI</p>
                <p className="text-[9px] text-slate-500 font-mono mt-1">Checkboard anomaly detected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-950/40 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Complete Safety Infrastructure</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything developers and platforms need to check upload authenticity, generate certifications, and configure policy triggers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">How TruthLens Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From ingest to verdict, see how video files transition through our frame analysis models.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 text-left relative flex flex-col justify-between h-48">
              <div>
                <span className="text-3xl font-black text-white/5 block mb-2">{st.num}</span>
                <h3 className="text-base font-bold mb-1 text-slate-200">{st.name}</h3>
                <p className="text-xs text-slate-400">{st.desc}</p>
              </div>
              {idx < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="bg-slate-950/40 border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Predictable Platform Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Scale authenticity checks from creator workflows to enterprise publishing scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {/* Developer */}
            <div className="glass-panel rounded-2xl p-8 border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Developer</h3>
                <p className="text-xs text-slate-500 mb-6">For individual testing and sandboxes.</p>
                <div className="text-3xl font-black mb-6">$0 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> 20 analyzes / month</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Frame & Face Isolation</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Basic trust score dashboard</li>
                </ul>
              </div>
              <Link href="/portal" className="w-full text-center py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold transition-all">
                Get Started
              </Link>
            </div>

            {/* Scale */}
            <div className="glass-panel rounded-2xl p-8 border-primary/40 relative flex flex-col justify-between shadow-xl shadow-indigo-600/5">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-primary text-[10px] font-black tracking-wider uppercase text-white">
                RECOMMENDED
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Scale Platform</h3>
                <p className="text-xs text-slate-500 mb-6">For content creators and growing brands.</p>
                <div className="text-3xl font-black mb-6">$299 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> 1,500 analyzes / month</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Full PDF trust certification</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Batch API uploads & Webhooks</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Dedicated processing queue</li>
                </ul>
              </div>
              <Link href="/portal" className="w-full text-center py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all">
                Try 14-Days Free
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-panel rounded-2xl p-8 border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Enterprise</h3>
                <p className="text-xs text-slate-500 mb-6">For large platforms & media publishers.</p>
                <div className="text-3xl font-black mb-6">Custom <span className="text-xs text-slate-500 font-normal">/ quote</span></div>
                <ul className="space-y-3 text-xs text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Unlimited API requests</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Custom fine-tuned weights</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> SLA guaranteed processing</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Security audits & admin logs</li>
                </ul>
              </div>
              <Link href="#" className="w-full text-center py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl overflow-hidden border border-white/5 transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  {faq.q}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-slate-900/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
