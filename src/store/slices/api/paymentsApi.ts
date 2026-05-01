import { baseApi } from './baseApi';

export type PaymentStatusFilter = 'pending' | 'success' | 'failed';

export type ApiPayment = {
  id: string;
  method: string;
  transactionId: string;
  senderNumber: string;
  totalAmount: number;
  teacherAmount?: number;
  platformAmount?: number;
  status: string;
  createdAt: string;
  student?: {
    user?: {
      name?: string;
      email?: string;
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

type GetPaymentsResponse = {
  items: ApiPayment[];
  total: number;
};

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<GetPaymentsResponse, PaymentStatusFilter | undefined>({
      query: (status) => ({
        url: '/payments/all',
        params: status ? { status } : {},
      }),
      providesTags: ['Payments'],
    }),
    approvePayment: builder.mutation<unknown, string>({
      query: (paymentId) => ({
        url: `/payments/approve/${paymentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Payments'],
    }),
    rejectPayment: builder.mutation<unknown, { paymentId: string; rejectionReason: string }>({
      query: ({ paymentId, rejectionReason }) => ({
        url: `/payments/reject/${paymentId}`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Payments'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
} = paymentsApi;
