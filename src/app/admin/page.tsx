'use client';

import React, { useState, useEffect } from 'react';
import {
  CatalogueItem,
  AssetRights,
  VisibilityStatus
} from '@/types';
import {
  ShieldCheck, Activity, Database, AlertOctagon,
  CheckCircle2, XCircle, RotateCcw, AlertTriangle, RefreshCw
} from 'lucide-react';

interface AdminDashboardData {
  metrics: {
    totalItems: number;
    publishedCount: number;
    quarantinedCount: number;
    licensedReaderCount: number;
    externalAuthorizedCount: number;
    metadataOnlyCount: number;
  };
  healthChecks: Record<string, { status: string; message: string; lastChecked: string }>;
  items: CatalogueItem[];
  assetRights: AssetRights[];
  auditEvents: Array<{
    id: string;
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    timestamp: string;
    details: string;
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'catalogue' | 'rights' | 'audit'>('overview');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      if (res.ok) {
        const json: AdminDashboardData = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateVisibility = async (itemId: string, status: VisibilityStatus) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_visibility',
          itemId,
          status,
          reason: `Manual status change to ${status}`
        })
      });
      if (res.ok) {
        setActionSuccess(`Item #${itemId} status updated to ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadAdminData();
      }
    } catch (e) {
      console.error('Update visibility failed:', e);
    }
  };

  const handleUpdateRights = async (assetId: string, status: 'approved' | 'pending' | 'revoked') => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rights',
          assetId,
          status
        })
      });
      if (res.ok) {
        setActionSuccess(`Asset #${assetId} rights status updated to ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadAdminData();
      }
    } catch (e) {
      console.error('Update rights failed:', e);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-500" />
              Nyamora Admin & Compliance Console
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
              Restricted Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Catalogue governance, rights register inspection, takedown quarantine, and audit log.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#181826] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Connectors
          </button>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'catalogue' ? 'bg-purple-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Catalogue Items ({data?.metrics.totalItems || 0})
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'rights' ? 'bg-purple-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rights Registry
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionSuccess}
        </div>
      )}

      {/* Tab: Overview & Connectors */}
      {activeTab === 'overview' && data && (
        <div className="space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Works</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{data.metrics.totalItems}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-emerald-400 uppercase font-bold">Published</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">{data.metrics.publishedCount}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-rose-400 uppercase font-bold">Quarantined</p>
              <p className="text-xl font-extrabold text-rose-400 mt-1">{data.metrics.quarantinedCount}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-purple-400 uppercase font-bold">Licensed Reader</p>
              <p className="text-xl font-extrabold text-purple-400 mt-1">{data.metrics.licensedReaderCount}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-sky-400 uppercase font-bold">DLsite Outbound</p>
              <p className="text-xl font-extrabold text-sky-400 mt-1">{data.metrics.externalAuthorizedCount}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130]">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Archival Only</p>
              <p className="text-xl font-extrabold text-slate-400 mt-1">{data.metrics.metadataOnlyCount}</p>
            </div>
          </div>

          {/* Connectors Health Status */}
          <div className="p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Connector Health & Architecture Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.healthChecks).map(([key, check]) => (
                <div key={key} className="p-3.5 rounded-xl border bg-slate-50 dark:bg-[#161624] border-slate-200 dark:border-[#222234] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="uppercase text-slate-700 dark:text-slate-300">{key}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{check.message}</p>
                  <p className="text-[9px] text-slate-500 pt-1 font-mono">Checked: {check.lastChecked.substring(11, 19)} UTC</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab: Catalogue Management */}
      {activeTab === 'catalogue' && data && (
        <div className="p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Catalogue Records ({data.items.length})
            </h3>
            <span className="text-xs text-slate-400">Manage visibility and takedowns</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-[#222234] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Creator</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d1d2b]">
                {data.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#171724]">
                    <td className="py-2.5 px-3 font-mono font-semibold">{item.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white truncate max-w-xs">{item.canonicalTitle}</td>
                    <td className="py-2.5 px-3 text-purple-400 font-semibold">{item.creatorName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1f1f2e] text-[10px] font-mono">
                        {item.availabilityMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.visibilityStatus === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.visibilityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {item.visibilityStatus === 'published' ? (
                        <button
                          onClick={() => handleUpdateVisibility(item.id, 'quarantined')}
                          className="px-2 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors text-[10px] font-semibold"
                        >
                          Quarantine
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateVisibility(item.id, 'published')}
                          className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-semibold"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rights Registry */}
      {activeTab === 'rights' && data && (
        <div className="p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Asset Rights Register ({data.assetRights.length})
            </h3>
            <span className="text-xs text-slate-400">Strict rights provenance verification</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-[#222234] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Asset ID</th>
                  <th className="py-2.5 px-3">Item Ref</th>
                  <th className="py-2.5 px-3">Licensor / Owner</th>
                  <th className="py-2.5 px-3">Permission Ref</th>
                  <th className="py-2.5 px-3">Allowed Use</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d1d2b]">
                {data.assetRights.map(asset => (
                  <tr key={asset.assetId} className="hover:bg-slate-50 dark:hover:bg-[#171724]">
                    <td className="py-2.5 px-3 font-mono">{asset.assetId}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-400">{asset.itemId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{asset.owner}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">{asset.permissionReference}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">{asset.allowedUse}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.reviewStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {asset.reviewStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {asset.reviewStatus !== 'approved' && (
                        <button
                          onClick={() => handleUpdateRights(asset.assetId, 'approved')}
                          className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {asset.reviewStatus !== 'revoked' && (
                        <button
                          onClick={() => handleUpdateRights(asset.assetId, 'revoked')}
                          className="px-2 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors text-[10px] font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && data && (
        <div className="p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Immutable Governance Audit Log ({data.auditEvents.length})
            </h3>
            <span className="text-xs text-slate-400">Append-only compliance trail</span>
          </div>

          <div className="space-y-2">
            {data.auditEvents.map(evt => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border bg-slate-50 dark:bg-[#151522] border-slate-200 dark:border-[#202030] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-400 font-bold">{evt.action}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#202030] text-[10px] text-slate-400">
                      Target: {evt.targetType} #{evt.targetId}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{evt.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono flex-shrink-0">
                  <p>Actor: {evt.actorId}</p>
                  <p>{evt.timestamp.replace('T', ' ').substring(0, 19)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
