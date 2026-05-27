import api from "../lib/api";

export interface BusItem {
  id: string;
  route: string;
  driver: string;
  coverage: string;
  students: number;
  status: string;
}

export async function fetchTransportData(): Promise<{ buses: BusItem[] }> {
  const { data } = await api.get<{ success: boolean; data: { buses: BusItem[] } }>("/api/transport/dashboard");
  return data.data;
}
