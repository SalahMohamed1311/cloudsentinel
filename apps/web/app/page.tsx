'use client';

import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
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
  TrendingUp,
  Server,
  Mail,
  ExternalLink,
  Zap,
  Target,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';

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
}

interface ScanResponse {
  id?: string;
  targetUrl: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  ssl: SslResult;
  headers: SecurityHeaderResult[];
  dns: DnsSecurityResult;
  scannedAt: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<ScanResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/scan/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // Ignore initial history fetch error if offline
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

const handleDownloadPdf = () => {
  const element = document.getElementById("scan-report");
  if (!element) return;

  html2pdf()
    .set({
      margin: 0.5,
      filename: `CloudSentinel_Report_${result?.targetUrl.replace(/https?:\/\//, "")}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    } as any)
    .from(element)
    .save();
};

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:3001/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Failed to scan target URL');
      }

      const data: ScanResponse = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20';
      case 'A':
        return 'bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/20';
      case 'B':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20';
      case 'C':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20';
    }
  };

  const getGradeBg = (grade: string) => {
    switch (grade) {
      case 'A+': return 'from-emerald-500 to-green-500';
      case 'A': return 'from-green-500 to-emerald-500';
      case 'B': return 'from-blue-500 to-indigo-500';
      case 'C': return 'from-yellow-500 to-amber-500';
      default: return 'from-red-500 to-rose-500';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">
        {/* Header */}
        <header className="w-full text-center my-8 md:my-12">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Security Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CloudSentinel
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Automated Cloud & Web Security Posture Scanner
          </p>
        </header>

        {/* Form Section */}
        <section className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5 mb-8 transition-all hover:shadow-blue-500/10">
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter website URL (e.g., github.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-800 disabled:to-indigo-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  Scan Now
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </section>

        {/* Results Section */}
        {result && (
          <section id="scan-report" className="w-full space-y-6 animate-fade-in">
            {/* Header Summary - Enhanced */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Target Info */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Target className="w-4 h-4" />
                    <span>Target Analyzed</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    {result.targetUrl}
                    <a 
                      href={result.targetUrl.startsWith('http') ? result.targetUrl : `https://${result.targetUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(result.scannedAt).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${result.ssl.valid ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-slate-300">{result.ssl.valid ? 'SSL Valid' : 'SSL Invalid'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${result.dns.spf.present && result.dns.dmarc.present ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                      <span className="text-slate-300">{result.dns.spf.present && result.dns.dmarc.present ? 'Email Security ✓' : 'Email Security ⚠'}</span>
                    </div>
                  </div>
                </div>

                {/* Right - Score & Grade */}
                <div className="flex items-center justify-start lg:justify-end gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                      <Award className="w-4 h-4" />
                      <span>Security Score</span>
                    </div>
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {result.score}
                      <span className="text-2xl text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className={`border-2 text-5xl font-black px-8 py-4 rounded-2xl shadow-lg ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF Report
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{result.headers.filter(h => h.present).length}/{result.headers.length}</div>
                <div className="text-xs text-slate-400 mt-1">Headers Present</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{result.ssl.daysRemaining}</div>
                <div className="text-xs text-slate-400 mt-1">Days SSL Valid</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">{result.ssl.tlsVersion}</div>
                <div className="text-xs text-slate-400 mt-1">TLS Protocol</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {result.dns.spf.present && result.dns.dmarc.present ? '✓' : '⚠'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Email Security</div>
              </div>
            </div>

            {/* SSL Status Card - Compact */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">SSL/TLS Certificate Analysis</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Status', value: result.ssl.valid ? '✓ Valid & Trusted' : '✗ Invalid / Expired', icon: result.ssl.valid ? CheckCircle : XCircle, color: result.ssl.valid ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Issuer', value: result.ssl.issuer, icon: Shield, color: 'text-blue-400' },
                  { label: 'Days Remaining', value: `${result.ssl.daysRemaining} days`, icon: Clock, color: 'text-blue-400' },
                  { label: 'TLS Protocol', value: result.ssl.tlsVersion, icon: Server, color: 'text-blue-400' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-slate-800/30 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <p className={`font-semibold text-sm truncate ${item.label === 'Status' ? (result.ssl.valid ? 'text-emerald-400' : 'text-red-400') : 'text-slate-200'}`}>
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Headers Card - Improved */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Security Headers</h3>
                <span className="ml-auto text-xs font-normal text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                  {result.headers.filter(h => h.present).length}/{result.headers.length} present
                </span>
              </div>
              <div className="space-y-2">
                {result.headers.map((h) => (
                  <div
                    key={h.header}
                    className={`bg-slate-800/30 border rounded-2xl p-4 transition ${
                      h.present ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-red-500/20 hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {h.present ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <span className="font-mono text-sm font-semibold text-slate-200">
                            {h.header}
                          </span>
                          {h.present && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              +10 pts
                            </span>
                          )}
                        </div>
                        {h.value && (
                          <p className="text-xs font-mono text-slate-400 mt-1.5 truncate max-w-xl bg-slate-900/50 rounded-lg px-3 py-1.5">
                            {h.value}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full w-fit flex-shrink-0 ${
                          h.present
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {h.present ? 'Present' : 'Missing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DNS Email Security Card - Improved */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">DNS Email Security</h3>
                <span className="ml-auto text-xs font-normal text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                  SPF & DMARC
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-2xl p-5 border transition ${
                  result.dns.spf.present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-sm font-semibold text-slate-200">SPF Record</span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        result.dns.spf.present
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {result.dns.spf.present ? '✓ Found (+10 pts)' : '✗ Missing'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-all bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    {result.dns.spf.record || 'No SPF TXT record detected.'}
                  </p>
                </div>

                <div className={`rounded-2xl p-5 border transition ${
                  result.dns.dmarc.present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-sm font-semibold text-slate-200">DMARC Record</span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        result.dns.dmarc.present
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {result.dns.dmarc.present ? '✓ Found (+10 pts)' : '✗ Missing'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-all bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    {result.dns.dmarc.record || 'No _dmarc TXT record detected.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* History Table Section - Improved */}
        {history.length > 0 && (
          <section className="w-full mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-200">Recent Scans History</h3>
              <span className="ml-auto text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                {history.length} scans
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300 text-xs uppercase font-mono">
                  <tr>
                    <th className="p-3 rounded-l-xl">Target URL</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3 hidden md:table-cell">Scanned At</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/5 transition">
                      <td className="p-3 font-semibold text-slate-200 text-sm truncate max-w-[120px] md:max-w-none">
                        {item.targetUrl}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{item.score}/100</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${getGradeColor(item.grade)}`}>
                          {item.grade}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-400 hidden md:table-cell">
                        {new Date(item.scannedAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setResult(item)}
                          className="text-xs bg-white/5 hover:bg-white/10 text-blue-400 font-semibold px-4 py-2 rounded-xl transition border border-white/5 hover:border-blue-400/30"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}