import { useQuery } from '@tanstack/react-query';
import { mockQrCode } from './mockData';

export const QR_QUERY_KEY = ['qr', 'current'] as const;

export const useQrCodeQuery = () => {
  return useQuery({
    queryKey: QR_QUERY_KEY,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        code: mockQrCode.code,
        expiresAt: new Date(mockQrCode.expiresAt), // Ensure it's a Date object
      };
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: false, // Avoids regenerating QR on tab focus
    staleTime: 55000, // Consider stale after 55 seconds (before the 60s refetch)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 mins
  });
};