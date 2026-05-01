import { baseApi } from './baseApi';

export type RevenueStats = {
  totalRevenueInPaisa: number;
  totalRevenueInTaka: number;
  totalTransactions: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
};

export type RevenuePayment = {
  id: string;
  method: string;
  totalAmount: number;
  teacherAmount: number;
  platformAmount: number;
  createdAt: string;
  student?: {
    user?: {
      name?: string;
    };
  };
  exam?: {
    title?: string;
  };
  teacher?: {
    user?: {
      name?: string;
    };
  };
};

type RevenuePaymentsResponse = {
  items: RevenuePayment[];
  total: number;
};

export const revenueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformRevenueStats: builder.query<RevenueStats, void>({
      query: () => '/payments/platform-revenue',
      providesTags: ['Revenue'],
    }),
    getRevenuePayments: builder.query<RevenuePaymentsResponse, void>({
      query: () => ({
        url: '/payments/all',
        params: { status: 'success' },
      }),
      providesTags: ['Revenue'],
    }),
  }),
});

export const { useGetPlatformRevenueStatsQuery, useGetRevenuePaymentsQuery } = revenueApi;
