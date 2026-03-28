import { useState, useEffect, useMemo } from 'react';
import { HardDrive } from 'lucide-react';

interface StorageUsageProps {
    promptsCount: number; // Used only as a trigger to recalculate
}

/**
 * Component to display the estimated browser storage usage.
 * Uses the Storage Estimate API (IndexedDB + caches + SW) when available,
 * falling back to a localStorage byte-count for older browsers.
 */
export function StorageUsage({ promptsCount }: StorageUsageProps) {
    const [usage, setUsage] = useState(0);  // in bytes
    const [quota, setQuota] = useState(50 * 1024 * 1024); // fallback 50 MB
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const calculateUsage = async () => {
            if (navigator.storage && navigator.storage.estimate) {
                const { usage: totalUsage, quota: totalQuota } = await navigator.storage.estimate();
                setUsage(totalUsage || 0);
                // Use real browser quota so the bar reflects actual limits
                if (totalQuota) setQuota(totalQuota);
            } else {
                // Fallback for browsers that don't support the Estimate API yet
                let total = 0;
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    const val = key ? window.localStorage.getItem(key) : '';
                    total += ((key?.length || 0) + (val?.length || 0)) * 2;
                }
                setUsage(total);
            }
        };

        calculateUsage();
        
        // Listen for storage changes in other tabs or through our custom sync event
        window.addEventListener('storage', calculateUsage);
        window.addEventListener('storage-sync', calculateUsage);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('storage', calculateUsage);
            window.removeEventListener('storage-sync', calculateUsage);
        };
    }, [promptsCount]);

    const percentage = useMemo(() => {
        const p = (usage / quota) * 100;
        return Math.min(Math.max(p, 0), 100);
    }, [usage, quota]);

    const usageMB = (usage / (1024 * 1024)).toFixed(2);
    const limitMB = (quota / (1024 * 1024)).toFixed(0);

    return (
        <div className="storage-usage-container" style={{ padding: '1rem', marginTop: 'auto' }}>
            <div className="storage-usage-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <HardDrive size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Storage Usage
                </span>
                
                {/* Online/Offline Badge */}
                <div style={{ 
                    marginLeft: 'auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isOnline ? '#22c55e' : '#ef4444',
                    fontWeight: 600
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
            </div>

            <div className="storage-usage-sub" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{usageMB} / {limitMB} MB</span>
            </div>
            
            <div className="storage-progress-bg" style={{ 
                height: '6px', 
                background: 'var(--bg-color)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
            }}>
                <div className="storage-progress-fill" style={{ 
                    height: '100%', 
                    width: `${percentage}%`,
                    background: percentage > 80 ? 'var(--danger-color)' : percentage > 50 ? '#f59e0b' : 'var(--primary-color)',
                    transition: 'width 0.3s ease'
                }} />
            </div>
            
            <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {percentage.toFixed(1)}% of browser quota used
            </div>
        </div>
    );
}
