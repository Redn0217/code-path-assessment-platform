
export const domains = [
  { id: 'python', name: 'Python' },
  { id: 'devops', name: 'DevOps' },
  { id: 'cloud', name: 'Cloud Computing' },
  { id: 'linux', name: 'Linux' },
  { id: 'networking', name: 'Networking' },
  { id: 'storage', name: 'Storage' },
  { id: 'virtualization', name: 'Virtualization' },
  { id: 'object-storage', name: 'Object Storage' },
  { id: 'ai-ml', name: 'AI & ML' },
  { id: 'data-security', name: 'Data Security' },
  { id: 'data-science', name: 'Data Science' }
];

import {
  CreditCard,
  LayoutGrid,
  LayoutList,
  Edit,
  Code,
  Database,
  Server,
  Cloud,
  Shield,
  BarChart,
  Brain,
  Cpu,
  Network,
  HardDrive,
  Monitor,
  Lock,
  TrendingUp,
  Settings,
  Zap,
  Globe
} from 'lucide-react';

export const iconComponents = {
  'card': CreditCard,
  'layout-grid': LayoutGrid,
  'layout-list': LayoutList,
  'edit': Edit,
  'code': Code,
  'database': Database,
  'server': Server,
  'cloud': Cloud,
  'shield': Shield,
  'bar-chart': BarChart,
  'brain': Brain,
  'cpu': Cpu,
  'network': Network,
  'hard-drive': HardDrive,
  'monitor': Monitor,
  'lock': Lock,
  'trending-up': TrendingUp,
  'settings': Settings,
  'zap': Zap,
  'globe': Globe
};

export const icons = [
  { value: 'card', label: 'Card', component: CreditCard },
  { value: 'layout-grid', label: 'Grid', component: LayoutGrid },
  { value: 'layout-list', label: 'List', component: LayoutList },
  { value: 'edit', label: 'Edit', component: Edit },
  { value: 'code', label: 'Code', component: Code },
  { value: 'database', label: 'Database', component: Database },
  { value: 'server', label: 'Server', component: Server },
  { value: 'cloud', label: 'Cloud', component: Cloud },
  { value: 'shield', label: 'Shield', component: Shield },
  { value: 'bar-chart', label: 'Chart', component: BarChart },
  { value: 'brain', label: 'Brain', component: Brain },
  { value: 'cpu', label: 'CPU', component: Cpu },
  { value: 'network', label: 'Network', component: Network },
  { value: 'hard-drive', label: 'Storage', component: HardDrive },
  { value: 'monitor', label: 'Monitor', component: Monitor },
  { value: 'lock', label: 'Security', component: Lock },
  { value: 'trending-up', label: 'Analytics', component: TrendingUp },
  { value: 'settings', label: 'Settings', component: Settings },
  { value: 'zap', label: 'Performance', component: Zap },
  { value: 'globe', label: 'Global', component: Globe }
];

export const getIconComponent = (iconName: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || CreditCard;
};

export const colors = [
  { value: 'bg-primary', label: 'Brand Green' },
  { value: 'bg-brand-navy', label: 'Brand Navy' },
  { value: 'bg-brand-navy-dark', label: 'Dark Navy' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' }
];
