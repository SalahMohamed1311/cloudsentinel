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
  Building,
  Users,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Edit,
  UserCheck,
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

/* ───────── Company Profile Types ───────── */
interface CompanyProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  annualRevenue: string;
  employeeCount: string;
  securityBudget: string;
  currentSecurityVendor: string;
  painPoints: string;
  leadStatus: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
  source: string;
  notes: string;
  updatedAt?: string;
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

/* ───────── Company Profile Form ───────── */
function CompanyProfileForm({
  profile,
  onSave,
  isEditing,
  setIsEditing,
}: {
  profile: CompanyProfile;
  onSave: (data: CompanyProfile) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) {
  const [formData, setFormData] = useState<CompanyProfile>(profile);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Government',
    'Non-Profit',
    'Energy',
    'Media',
    'Other',
  ];

  const leadStatusOptions = [
    'new',
    'contacted',
    'qualified',
    'proposal',
    'closed',
  ] as const;

  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  const revenueOptions = [
    'Under $1M',
    '$1M - $5M',
    '$5M - $20M',
    '$20M - $100M',
    '$100M+',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Building className="w-4 h-4 inline mr-2 text-blue-400" />
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="Acme Corp"
            required
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2 text-purple-400" />
            Industry
          </label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all disabled:opacity-50"
          >
            <option value="">Select Industry</option>
            {industryOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#030712]">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2 text-cyan-400" />
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="https://acme.com"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Users className="w-4 h-4 inline mr-2 text-emerald-400" />
            Contact Person
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2 text-yellow-400" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="john@acme.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2 text-indigo-400" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Users className="w-4 h-4 inline mr-2 text-pink-400" />
            Company Size
          </label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all disabled:opacity-50"
          >
            <option value="">Select Size</option>
            {companySizeOptions.map((size) => (
              <option key={size} value={size} className="bg-[#030712]">
                {size} employees
              </option>
            ))}
          </select>
        </div>

        {/* Annual Revenue */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-2 text-green-400" />
            Annual Revenue
          </label>
          <select
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all disabled:opacity-50"
          >
            <option value="">Select Revenue Range</option>
            {revenueOptions.map((rev) => (
              <option key={rev} value={rev} className="bg-[#030712]">
                {rev}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2 text-red-400" />
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="123 Main St, City, Country"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2 text-purple-400" />
            Company Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50 resize-none"
            placeholder="Brief description of your company..."
          />
        </div>

        {/* Security Details */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Shield className="w-4 h-4 inline mr-2 text-blue-400" />
            Security Budget
          </label>
          <input
            type="text"
            name="securityBudget"
            value={formData.securityBudget}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="e.g. $50,000/year"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Server className="w-4 h-4 inline mr-2 text-cyan-400" />
            Current Security Vendor
          </label>
          <input
            type="text"
            name="currentSecurityVendor"
            value={formData.currentSecurityVendor}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="e.g. CloudFlare, AWS Shield"
          />
        </div>

        {/* Lead Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <UserCheck className="w-4 h-4 inline mr-2 text-yellow-400" />
            Lead Status
          </label>
          <select
            name="leadStatus"
            value={formData.leadStatus}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all disabled:opacity-50"
          >
            {leadStatusOptions.map((status) => (
              <option key={status} value={status} className="bg-[#030712]">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <ExternalLink className="w-4 h-4 inline mr-2 text-indigo-400" />
            Lead Source
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
            placeholder="e.g. Website, Referral, LinkedIn"
          />
        </div>

        {/* Pain Points */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <AlertCircle className="w-4 h-4 inline mr-2 text-red-400" />
            Pain Points / Challenges
          </label>
          <textarea
            name="painPoints"
            value={formData.painPoints}
            onChange={handleChange}
            disabled={!isEditing}
            rows={2}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50 resize-none"
            placeholder="What security challenges is the company facing?"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Edit className="w-4 h-4 inline mr-2 text-purple-400" />
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={!isEditing}
            rows={2}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 disabled:opacity-50 resize-none"
            placeholder="Additional notes for the sales team..."
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="glass text-slate-300 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
}

/* ───────── Company Profile Viewer ───────── */
function CompanyProfileView({ profile }: { profile: CompanyProfile }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      qualified: 'bg-green-500/20 text-green-400 border-green-500/20',
      proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
      closed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    };
    return colors[status] || colors.new;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold text-lg">{profile.companyName}</span>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(profile.leadStatus)}`}
        >
          {profile.leadStatus.charAt(0).toUpperCase() + profile.leadStatus.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.industry && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Industry</span>
            <p className="text-white font-semibold">{profile.industry}</p>
          </div>
        )}
        {profile.companySize && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Company Size</span>
            <p className="text-white font-semibold">{profile.companySize} employees</p>
          </div>
        )}
        {profile.annualRevenue && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Annual Revenue</span>
            <p className="text-white font-semibold">{profile.annualRevenue}</p>
          </div>
        )}
        {profile.website && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Website</span>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              {profile.website.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {profile.contactPerson && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Contact Person</span>
            <p className="text-white font-semibold">{profile.contactPerson}</p>
          </div>
        )}
        {profile.email && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Email</span>
            <p className="text-white font-semibold text-sm">{profile.email}</p>
          </div>
        )}
        {profile.phone && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Phone</span>
            <p className="text-white font-semibold">{profile.phone}</p>
          </div>
        )}
        {profile.address && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Address</span>
            <p className="text-white font-semibold text-sm">{profile.address}</p>
          </div>
        )}
        {profile.currentSecurityVendor && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Security Vendor</span>
            <p className="text-white font-semibold">{profile.currentSecurityVendor}</p>
          </div>
        )}
        {profile.securityBudget && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Security Budget</span>
            <p className="text-white font-semibold">{profile.securityBudget}</p>
          </div>
        )}
        {profile.source && (
          <div className="glass rounded-xl p-3">
            <span className="text-xs text-slate-500">Lead Source</span>
            <p className="text-white font-semibold">{profile.source}</p>
          </div>
        )}
      </div>

      {profile.description && (
        <div className="glass rounded-xl p-4">
          <span className="text-xs text-slate-500">Description</span>
          <p className="text-white/80 mt-1">{profile.description}</p>
        </div>
      )}

      {profile.painPoints && (
        <div className="glass rounded-xl p-4 border-red-500/10">
          <span className="text-xs text-slate-500 flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-red-400" />
            Pain Points
          </span>
          <p className="text-white/80 mt-1">{profile.painPoints}</p>
        </div>
      )}

      {profile.notes && (
        <div className="glass rounded-xl p-4 border-purple-500/10">
          <span className="text-xs text-slate-500 flex items-center gap-2">
            <Edit className="w-3 h-3 text-purple-400" />
            Notes
          </span>
          <p className="text-white/80 mt-1">{profile.notes}</p>
        </div>
      )}

      {profile.updatedAt && (
        <div className="text-xs text-slate-500 text-right">
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  DASHBOARD COMPONENT                   */
/* ═══════════════════════════════════════ */
function DashboardPage({
  companyProfile,
  onUpdateProfile,
}: {
  companyProfile: CompanyProfile | null;
  onUpdateProfile: (data: CompanyProfile) => void;
}) {
  const { user } = useUser();
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState<CompanyProfile>(
    companyProfile || {
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      contactPerson: '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      phone: '',
      address: '',
      description: '',
      annualRevenue: '',
      employeeCount: '',
      securityBudget: '',
      currentSecurityVendor: '',
      painPoints: '',
      leadStatus: 'new',
      source: '',
      notes: '',
    }
  );

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
              scans: [],
            });
          }
          websitesMap.get(scan.targetUrl).scans.push({
            scannedAt: scan.scannedAt,
            score: scan.score,
          });
        });
        const websitesArray = Array.from(websitesMap.values());
        websitesArray.forEach((site) => {
          site.scans.sort(
            (a: any, b: any) =>
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

  // Update local profile when companyProfile changes
  useEffect(() => {
    if (companyProfile) {
      setLocalProfile(companyProfile);
    }
  }, [companyProfile]);

  const handleSaveProfile = (data: CompanyProfile) => {
    setLocalProfile(data);
    onUpdateProfile(data);
    setIsEditing(false);
  };

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

  return (
    <div className="space-y-8">
      {/* Company Profile Section */}
      <section className="glass-strong rounded-3xl p-8 hover-glow animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Company Profile</h3>
            <p className="text-xs text-slate-500">
              Manage your company information for sales team reference
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-auto glass text-blue-400 hover:text-blue-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <CompanyProfileForm
            profile={localProfile}
            onSave={handleSaveProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        ) : (
          <CompanyProfileView profile={localProfile} />
        )}
      </section>

      {/* Scan History Section */}
      {websites.length > 0 && (
        <section className="glass-strong rounded-3xl p-8 hover-glow animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dashboard</h3>
              <p className="text-xs text-slate-500">
                Analyze performance and security of scanned websites
              </p>
            </div>
            <span className="ml-auto text-xs text-slate-400 glass px-3 py-1.5 rounded-full">
              {websites.length} websites
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
                  Scans: {site.scans.length}
                </p>
                <div className="h-48">
                  {site.scans && site.scans.length > 0 ? (
                    <ScoreChart data={site.scans} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  MAIN COMPONENT                        */
/* ═══════════════════════════════════════ */
export default function Home() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [history, setHistory] = useState<ScanResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  /* ── load company profile ── */
  const loadCompanyProfile = async () => {
    if (!user?.id) return;
    setIsLoadingProfile(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company-profile/${user.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setCompanyProfile(data);
      } else if (res.status === 404) {
        // No profile found, use default
        setCompanyProfile({
          companyName: '',
          industry: '',
          companySize: '',
          website: '',
          contactPerson: '',
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          phone: '',
          address: '',
          description: '',
          annualRevenue: '',
          employeeCount: '',
          securityBudget: '',
          currentSecurityVendor: '',
          painPoints: '',
          leadStatus: 'new',
          source: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /* ── save company profile ── */
  const saveCompanyProfile = async (data: CompanyProfile) => {
    if (!user?.id) return;
    try {
      const payload = {
        ...data,
        clerkId: user.id,
        updatedAt: new Date().toISOString(),
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setCompanyProfile(saved);
        console.log('✅ Company profile saved successfully');
      } else {
        console.error('Failed to save profile:', await res.text());
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
    }
  };

  /* ── history ── */
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/history`);
      if (res.ok) setHistory(await res.json());
    } catch {
      /* offline */
    }
  };

  useEffect(() => {
    fetchHistory();
    if (isSignedIn) {
      loadCompanyProfile();
    }
  }, [isSignedIn, user?.id]);

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
      alert('⚠️ Error downloading report');
    }
  };

  /* ── scan ── */
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError('⚠️ Please sign in to perform a scan');
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
          200
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

  const safeHeaders = Array.isArray(result?.headers)
    ? result.headers
    : (result?.headers as any)?.data || [];

  const presentHeadersCount = safeHeaders.filter(
    (h: any) => h?.present || h?.data?.present
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

            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    {showDashboard ? 'Hide' : 'Dashboard'}
                  </button>
                  <UserButton />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>

        {/* ── Dashboard ── */}
        {showDashboard && isSignedIn && (
          <DashboardPage
            companyProfile={companyProfile}
            onUpdateProfile={saveCompanyProfile}
          />
        )}

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
                style={{
                  animationDelay: `${0.3 + i * 0.1}s`,
                  animationFillMode: 'forwards',
                }}
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
            {!isSignedIn && (
              <div className="mb-4 flex items-center gap-3 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 animate-scale-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  🔒 Please sign in to use the scan feature
                </p>
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
                    placeholder={isSignedIn ? 'e.g. github.com, google.com' : '🔒 Sign in first'}
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
                      <span>{isSignedIn ? 'Scan Now' : '🔒 Sign in'}</span>
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

        {/* ═══════ Results ═══════ */}
        {result && (
          <section
            ref={resultRef}
            id="scan-report"
            className="space-y-8 animate-fade-in-up"
          >
            {/* ── Score Overview ── */}
            <div className="glass-strong rounded-3xl p-8 glow-blue">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5" />
                    <span>Scan Complete</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white break-all">
                    {result.targetUrl}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge
                      active={!!result.ssl?.valid}
                      label={result.ssl?.valid ? 'SSL Valid' : 'SSL Invalid'}
                    />
                    <StatusBadge
                      active={!!(result.dns?.spf?.present && result.dns?.dmarc?.present)}
                      label={
                        result.dns?.spf?.present && result.dns?.dmarc?.present
                          ? 'Email Secured'
                          : 'Email Warning'
                      }
                    />
                  </div>

                  {(result.fingerprint?.cloudProvider ||
                    result.fingerprint?.waf ||
                    result.fingerprint?.cms) && (
                    <div className="flex flex-wrap gap-2">
                      {result.fingerprint?.cloudProvider && (
                        <DetectionPill
                          icon={Server}
                          label={result.fingerprint.cloudProvider}
                          color="blue"
                        />
                      )}
                      {result.fingerprint?.waf && (
                        <DetectionPill
                          icon={ShieldCheck}
                          label={`${result.fingerprint.waf} WAF`}
                          color="purple"
                        />
                      )}
                      {result.fingerprint?.cms && (
                        <DetectionPill
                          icon={Fingerprint}
                          label={result.fingerprint.cms}
                          color="cyan"
                        />
                      )}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {result.scannedAt ? new Date(result.scannedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center">
                  <ScoreCircle score={result.score} grade={result.grade} />
                </div>

                <div className="lg:col-span-3 flex flex-col items-center lg:items-end gap-4">
                  <div
                    className={`border-2 text-6xl font-black px-10 py-5 rounded-3xl shadow-2xl ${getGradeColor(result.grade)}`}
                  >
                    {result.grade || 'F'}
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    className="glass hover-glow text-slate-200 px-6 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Headers Present',
                  value: `${presentHeadersCount}/${safeHeaders.length}`,
                  icon: Shield,
                  color: 'from-blue-500/20 to-indigo-500/20',
                  iconColor: 'text-blue-400',
                },
                {
                  label: 'SSL Days Left',
                  value: `${result.ssl?.daysRemaining ?? 0}`,
                  icon: Clock,
                  color: 'from-emerald-500/20 to-cyan-500/20',
                  iconColor: 'text-emerald-400',
                },
                {
                  label: 'TLS Protocol',
                  value: result.ssl?.tlsVersion || 'N/A',
                  icon: Lock,
                  color: 'from-purple-500/20 to-pink-500/20',
                  iconColor: 'text-purple-400',
                },
                {
                  label: 'Email Security',
                  value:
                    result.dns?.spf?.present && result.dns?.dmarc?.present
                      ? 'Protected'
                      : 'At Risk',
                  icon: Mail,
                  color: 'from-yellow-500/20 to-orange-500/20',
                  iconColor: 'text-yellow-400',
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="glass rounded-2xl p-5 hover-lift opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── SSL Card ── */}
            <div className="glass-strong rounded-3xl p-8 hover-glow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    SSL / TLS Certificate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certificate validation & protocol analysis
                  </p>
                </div>
                <span
                  className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${
                    result.ssl?.valid
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {result.ssl?.valid ? '✓ Trusted' : '✗ Invalid'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Certificate Status',
                    value: result.ssl?.valid
                      ? '✓ Valid & Trusted'
                      : '✗ Invalid',
                    icon: result.ssl?.valid ? CheckCircle : XCircle,
                    color: result.ssl?.valid
                      ? 'text-emerald-400'
                      : 'text-red-400',
                    bg: result.ssl?.valid
                      ? 'bg-emerald-500/5 border-emerald-500/10'
                      : 'bg-red-500/5 border-red-500/10',
                  },
                  {
                    label: 'Certificate Issuer',
                    value: result.ssl?.issuer || 'Unknown',
                    icon: Shield,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/5 border-blue-500/10',
                  },
                  {
                    label: 'Days Remaining',
                    value: `${result.ssl?.daysRemaining ?? 0} days`,
                    icon: Clock,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/5 border-cyan-500/10',
                  },
                  {
                    label: 'TLS Protocol',
                    value: result.ssl?.tlsVersion || 'Unknown',
                    icon: Server,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/5 border-purple-500/10',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl p-5 border transition hover-lift ${item.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {item.label}
                        </span>
                      </div>
                      <p
                        className={`font-bold text-sm truncate ${
                          item.label === 'Certificate Status'
                            ? item.color
                            : 'text-white'
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Infrastructure Fingerprint ── */}
            {result.fingerprint && (
              <div className="glass-strong rounded-3xl p-8 hover-glow">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Infrastructure Fingerprint
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cloud provider, Web Application Firewall and CMS detection
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Server className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Cloud Provider
                        </p>
                        <p className="text-lg font-bold text-white">
                          {result.fingerprint?.cloudProvider || 'Not Detected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-purple-500/5 border border-purple-500/10 p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Web Application Firewall
                        </p>
                        <p className="text-lg font-bold text-white">
                          {result.fingerprint?.waf || 'Not Detected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cyan-500/5 border border-cyan-500/10 p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Content Management System
                        </p>
                        <p className="text-lg font-bold text-white">
                          {result.fingerprint?.cms || 'Not Detected'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security Headers ── */}
            <div className="glass-strong rounded-3xl p-8 hover-glow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Security Headers
                  </h3>
                  <p className="text-xs text-slate-500">
                    HTTP response header analysis
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {presentHeadersCount}
                  </span>
                  <span className="text-sm text-slate-500">
                    /{safeHeaders.length}
                  </span>
                  <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden ml-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          safeHeaders.length > 0
                            ? `${(presentHeadersCount / safeHeaders.length) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {safeHeaders.map((h: any, idx: number) => {
                  if (!h) return null;
                  const isPresent = h?.present ?? h?.data?.present ?? false;
                  const headerName = h?.header ?? h?.data?.header ?? `Header #${idx + 1}`;
                  const headerValue = h?.value ?? h?.data?.value ?? null;
                  const headerScore = h?.score ?? h?.data?.score ?? 0;

                  return (
                    <div
                      key={headerName || idx}
                      className={`rounded-2xl p-5 border transition-all hover-lift opacity-0 animate-fade-in-up ${
                        isPresent
                          ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
                          : 'bg-red-500/5 border-red-500/10 hover:border-red-500/30'
                      }`}
                      style={{
                        animationDelay: `${idx * 0.05}s`,
                        animationFillMode: 'forwards',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {isPresent ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                              </div>
                            )}
                            <span className="font-mono text-sm font-bold text-white">
                              {headerName}
                            </span>
                            {isPresent && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                +{headerScore} pts
                              </span>
                            )}
                          </div>
                          {headerValue && (
                            <p className="text-xs font-mono text-slate-500 mt-2 truncate max-w-2xl bg-black/20 rounded-xl px-4 py-2 border border-white/5">
                              {headerValue}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold px-4 py-2 rounded-xl w-fit flex-shrink-0 ${
                            isPresent
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isPresent ? 'Present' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DNS Email Security ── */}
            <div className="glass-strong rounded-3xl p-8 hover-glow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    DNS Email Security
                  </h3>
                  <p className="text-xs text-slate-500">
                    SPF, DKIM, DMARC & DNSSEC record validation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: 'SPF Record',
                    data: result.dns?.spf,
                    desc: 'Sender Policy Framework prevents email spoofing',
                  },
                  {
                    label: 'DMARC Record',
                    data: result.dns?.dmarc,
                    desc: 'Domain-based Message Authentication & Reporting',
                  },
                  {
                    label: 'DKIM Record',
                    data: result.dns?.dkim,
                    desc: 'DomainKeys Identified Mail signs outgoing email',
                  },
                  {
                    label: 'DNSSEC',
                    data: result.dns?.dnssec,
                    desc: 'Prevents DNS spoofing & cache poisoning',
                  },
                ].map((item, idx) => {
                  const isPresent = !!item.data?.present;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl p-6 border transition hover-lift ${
                        isPresent
                          ? 'bg-emerald-500/5 border-emerald-500/10'
                          : 'bg-red-500/5 border-red-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-mono text-sm font-bold text-white">
                            {item.label}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            isPresent
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {isPresent ? '✓ Found' : '✗ Missing'}
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <p className="text-xs font-mono text-slate-400 break-all leading-relaxed">
                          {item.data?.record || 'No record detected.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Recommendations ── */}
            {Array.isArray(result.recommendations) &&
              result.recommendations.length > 0 && (
                <div className="glass-strong rounded-3xl p-8 hover-glow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Recommendations
                      </h3>
                      <p className="text-xs text-slate-500">
                        Fixes to improve this security score
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 text-sm text-slate-300"
                      >
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </section>
        )}

        {/* ═══════ History ═══════ */}
        {history.length > 0 && (
          <section className="mt-12 glass-strong rounded-3xl p-8 hover-glow animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Scan History</h3>
                <p className="text-xs text-slate-500">
                  Previously analyzed targets
                </p>
              </div>
              <span className="ml-auto text-xs text-slate-400 glass px-3 py-1.5 rounded-full">
                {history.length} scans
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="font-semibold text-white text-sm truncate max-w-[180px]">
                            {item.targetUrl}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-mono font-bold ${getScoreColor(item.score)}`}
                        >
                          {item.score ?? 0}
                          <span className="text-slate-600">/100</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getGradeColor(item.grade)}`}
                        >
                          {item.grade || 'F'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 hidden md:table-cell">
                        {item.scannedAt ? new Date(item.scannedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setResult(item);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="glass hover:bg-white/10 text-blue-400 font-semibold px-5 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 ml-auto group-hover:shadow-lg group-hover:shadow-blue-500/10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="text-center mt-16 mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4" />
            <span className="font-semibold gradient-text">CloudSentinel</span>
          </div>
          <p className="text-xs text-slate-600">
            Security Intelligence Platform • Built for the Modern Web
          </p>
        </footer>
      </div>
    </main>
  );
}
