import { StatCard } from '@/components/shared';
import { KPICardProps } from '@/types/dashboard';

export const KPICard = ({ label, value, subvalue, icon, color }: KPICardProps) => (
    <StatCard label={label} value={value} subvalue={subvalue} icon={icon} color={color} variant="kpi" />
);
