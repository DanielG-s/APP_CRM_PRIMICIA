/**
 * Represents the daily total sales summary.
 */
export interface DashboardTotal {
    /** Total revenue for the day */
    total: number;
    /** Number of transactions */
    count: number;
}

/**
 * Represents a data point for sales history charts.
 */
export interface HistoryItem {
    /** Label for the period (e.g., "01/01") */
    name: string;
    /** Sales volume or revenue */
    vendas: number;
}

/**
 * Represents a succinct view of a recent transaction.
 */
export interface RecentSale {
    id: string;
    customer: string;
    store: string;
    value: number;
    /** ISO Date string */
    date: string;
}

export interface KPICardProps {
    label: string;
    value: string;
    subvalue?: string;
    icon: React.ReactNode;
    color: string;
}

export interface ShortcutCardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}
