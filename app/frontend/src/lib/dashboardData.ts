import dashboardJson from "../../public/data/dashboard_data.json";
import type { DashboardData } from "../types/dashboard";

export const dashboardData = dashboardJson as unknown as DashboardData;

export const dashboardDataUrl = "/data/dashboard_data.json";

export function getDashboardData(): DashboardData {
  return dashboardData;
}
