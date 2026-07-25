'use client';

export const dynamic = 'force-dynamic';
import ScoreChart from '../components/ScoreChart';
import { useUser, useClerk, SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Shield,
  Lock,
  Globe,
  Download,
  Scan,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Server,
  Mail,
  ExternalLink,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Eye,
  TrendingUp,
  Activity,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Radio,
} from 'lucide-react';
/* ───────── types ───────── */
interface SslResult {
  valid: boolean;
  issuer: string;
  validTo: string;
  daysRemaining: number;
  tlsVersion: string;
}

interface SecurityHeaderResult {
  header: string;
  present: boolean;
  value: string | null;
  score: number;
}

interface DnsSecurityResult {
  spf: { present: boolean; record: string | null };
  dmarc: { present: boolean; record: string | null };
  dkim: { present: boolean; record: string | null };
  dnssec: { present: boolean; record: string | null };
}

interface FingerprintResult {
  cloudProvider: string | null;
  waf: string | null;
  cms: string | null;
}

interface ScanResponse {
  id?: string;
  targetUrl: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  ssl: SslResult;
  headers: SecurityHeaderResult[];
  dns: DnsSecurityResult;
  fingerprint: FingerprintResult;
  recommendations: string[];
  scannedAt: string;
}

/* ───────── Score Circle Component ───────── */
function ScoreCircle({ score, grade }: { score: number; grade: string }) {
  const safeScore = score ?? 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  const getGradientId = () => {
    if (safeScore >= 90) return 'emerald';
    if (safeScore >= 70) return 'blue';
    if (safeScore >= 50) return 'yellow';
    return 'red';
  };

  return (
    <div className="score-circle relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <circle className="circle-bg" cx="70" cy="70" r={radius} />
        <circle
          className="circle-progress"
          cx="70"
          cy="70"
          r={radius}
          stroke={`url(#${getGradientId()})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{safeScore}</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ───────── Particle Background ───────── */
function ParticleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] animate-float" />
      <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px] animate-float delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] animate-float delay-500" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[80px] animate-float delay-700" />

      <div className="absolute inset-0 grid-pattern opacity-50" />

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 16}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────── Status Badge ───────── */
function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`}
        />
        {active && (
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
        )}
      </div>
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

/* ───────── Detection Pill ───────── */
function DetectionPill({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: 'blue' | 'purple' | 'cyan';
}) {
  const colorMap = {
    blue: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
    cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  };
  return (
    <span
      className={`text-[11px] font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${colorMap[color]}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════ */
/*  DASHBOARD COMPONENT                   */
/* ═══════════════════════════════════════ */
function DashboardPage() {
  const { user } = useUser();
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebsites() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/scan/history`
        );
        const historyData = res.data;
        const websitesMap = new Map();
        historyData.forEach((scan: any) => {
          if (!websitesMap.has(scan.targetUrl)) {
            websitesMap.set(scan.targetUrl, {
              id: scan.id,
              url: scan.targetUrl,
              scans: []
            });
          }
          websitesMap.get(scan.targetUrl).scans.push({
            scannedAt: scan.scannedAt,
            score: scan.score
          });
        });
        const websitesArray = Array.from(websitesMap.values());
        websitesArray.forEach(site => {
          site.scans.sort((a: any, b: any) =>
            new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
          );
        });
        setWebsites(websitesArray);
      } catch (err) {
        console.error('Error fetching websites:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWebsites();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Please sign in to view your dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No websites scanned yet. Start scanning to see results here!</p>
      </div>
    );
  }

  return (
    <section className="mt-12 glass-strong rounded-3xl p-8 hover-glow animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">لوحة تحكم المواقع</h3>
          <p className="text-xs text-slate-500">تحليل أداء وأمان المواقع الممسوحة</p>
        </div>
        <span className="ml-auto text-xs text-slate-400 glass px-3 py-1.5 rounded-full">
          {websites.length} مواقع
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {websites.map((site) => (
          <div
            key={site.id}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <h2 className="text-lg font-semibold text-white mb-2 truncate">
              {site.url}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              عدد الفحوصات: {site.scans.length}
            </p>
            <div className="h-48">
              {site.scans && site.scans.length > 0 ? (
                <ScoreChart data={site.scans} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  لا توجد بيانات كافية
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/*  MAIN COMPONENT                        */
/* ═══════════════════════════════════════ */
export default function Home() {
  const { isSignedIn, user } = useUser(); // ✅ تم إضافة user
  const { signOut } = useClerk();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<ScanResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  /* ── history ── */
  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/history`,
      );
      if (res.ok) setHistory(await res.json());
    } catch {
      /* offline */
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ── progress simulation ── */
  useEffect(() => {
    if (!loading) {
      setScanProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  /* ── PDF ── */
  const handleDownloadPdf = async () => {
    const el = document.getElementById('scan-report');
    if (!el) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin: 0.5,
          filename: `CloudSentinel_${result?.targetUrl?.replace(/https?:\/\//, '') || 'report'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'in' as const,
            format: 'letter' as const,
            orientation: 'portrait' as const,
          },
        })
        .from(el)
        .save();
    } catch {
      alert('⚠️ حدث خطأ في تحميل التقرير');
    }
  };

  /* ── scan ── */
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔒 منع الـ Scan للمستخدمين غير المسجلين
    if (!isSignedIn) {
      setError('⚠️ يرجى تسجيل الدخول أولاً لإجراء الفحص');
      return;
    }
    
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, clerkId: user?.id }),
      });
      if (!res.ok) throw new Error('Failed to scan target URL');
      const data: ScanResponse = await res.json();
      setScanProgress(100);
      setTimeout(() => {
        setResult(data);
        fetchHistory();
        setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: 'smooth' }),
          200,
        );
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ── helpers ── */
  const getGradeColor = (grade: string) => {
    const m: Record<string, string> = {
      'A+': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20',
      A: 'bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/20',
      B: 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20',
      C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20',
    };
    return m[grade] ?? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20';
  };

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-400';
    if (s >= 70) return 'text-blue-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Safe Headers Extractor
  const safeHeaders = Array.isArray(result?.headers)
    ? result.headers
    : (result?.headers as any)?.data || [];

  const presentHeadersCount = safeHeaders.filter(
    (h: any) => h?.present || h?.data?.present,
  ).length;

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 relative">
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* ── Navbar ── */}
        <nav className="glass rounded-2xl px-6 py-4 flex items-center justify-between mb-12 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#030712]" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">CloudSentinel</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Security Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>System Active</span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>{history.length} Scans</span>
              </div>
            </div>

            {/* أزرار المصادقة عبر Clerk */}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    {showDashboard ? 'إخفاء' : 'لوحة التحكم'}
                  </button>
                  <UserButton />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20">
                    تسجيل الدخول
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>

        {/* ── Dashboard ── */}
        {showDashboard && isSignedIn && <DashboardPage />}

        {/* ── Hero ── */}
        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-slate-300">
              Advanced Threat Detection & Analysis
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
            <span className="gradient-text">Scan.</span>{' '}
            <span className="text-white">Analyze.</span>{' '}
            <span className="gradient-text">Secure.</span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade security scanning for SSL/TLS certificates,
            HTTP security headers, and DNS email authentication.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
            {[
              { icon: ShieldCheck, label: 'SSL Analysis', color: 'text-emerald-400' },
              { icon: Fingerprint, label: 'Header Scan', color: 'text-blue-400' },
              { icon: Mail, label: 'DNS Security', color: 'text-purple-400' },
              { icon: Zap, label: 'Instant Results', color: 'text-yellow-400' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-slate-400 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Scan Form ── */}
        <section className="max-w-3xl mx-auto mb-16 animate-fade-in-up delay-300">
          <div className="glass-strong rounded-3xl p-8 glow-blue hover-glow">
            {/* رسالة للمستخدمين غير المسجلين */}
            {!isSignedIn && (
              <div className="mb-4 flex items-center gap-3 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 animate-scale-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">🔒 يرجى تسجيل الدخول لاستخدام ميزة الفحص</p>
              </div>
            )}

            <form onSubmit={handleScan} className="space-y-4">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                Target URL
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder={isSignedIn ? "e.g. github.com, google.com" : "🔒 سجل دخول أولاً"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={!isSignedIn}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url || !isSignedIn}
                  className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center justify-center gap-3 min-w-[160px] overflow-hidden group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>{isSignedIn ? 'Scan Now' : '🔒 تسجيل الدخول'}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </>
                  )}
                </button>
              </div>

              {loading && (
                <div className="space-y-2 animate-fade-in-up">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                      Scanning in progress...
                    </span>
                    <span>{Math.round(scanProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 animate-scale-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ باقي الكود (Results, History, Footer) ═══════ */}
        {/* ... باقي الكود كما هو ... */}

      </div>
    </main>
  );
}