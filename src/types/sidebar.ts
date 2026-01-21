/**
 * Sidebar types
 */

import type { GraphResponse } from '.';

export interface SidebarProps {
  selectedKabupaten: string;
  onKabupatenChange: (val: string) => void;
  selectedDesa: string;
  onDesaChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  walletBalance: number;
  apiData?: GraphResponse | null;
}
