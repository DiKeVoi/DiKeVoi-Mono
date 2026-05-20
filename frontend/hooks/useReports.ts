import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsService } from "@/services/reports";
import type { ReportStatus } from "@/types/api";

export const REPORTS_KEY = "reports";

export function useReports(status?: ReportStatus) {
  return useQuery({
    queryKey: [REPORTS_KEY, status],
    queryFn: () => reportsService.list(status),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: [REPORTS_KEY, id],
    queryFn: () => reportsService.get(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [REPORTS_KEY] }),
  });
}
