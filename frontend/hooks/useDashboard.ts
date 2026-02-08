import { useState, useEffect } from 'react';
import { DashboardTotal, HistoryItem, RecentSale } from '@/types/dashboard';

import { API_BASE_URL } from '@/lib/config';



/**
 * Custom hook to manage Dashboard data state.
 * Fetches daily totals, sales history, and recent transactions from the API.
 * 
 * @returns {object} Dashboard state (dailyTotal, history, recentSales, loading, error).
 */
export function useDashboard() {
    const [dailyTotal, setDailyTotal] = useState<DashboardTotal>({ total: 0, count: 0 });
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                // Utilizando Promise.all para paralelizar as requisições para melhor performance
                const [resTotal, resHistory, resRecent] = await Promise.all([
                    fetch(`${API_BASE_URL}/webhook/erp/dashboard-total`),
                    fetch(`${API_BASE_URL}/webhook/erp/dashboard-history`),
                    fetch(`${API_BASE_URL}/webhook/erp/recent-sales`)
                ]);

                if (resTotal.ok) setDailyTotal(await resTotal.json());
                if (resHistory.ok) setHistory(await resHistory.json());
                if (resRecent.ok) setRecentSales(await resRecent.json());

            } catch (err) {
                console.error("Erro ao carregar dashboard", err);
                setError("Falha ao carregar dados do dashboard.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return { dailyTotal, history, recentSales, loading, error };
}
