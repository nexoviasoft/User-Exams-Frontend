import { baseApi } from './baseApi';

export interface TeacherRequest {
  id: string;
  phone: string;
  education: string;
  platformName: string;
  location: string;
  photo: string;
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
  isActive: boolean;
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  education?: string;
  platformName?: string;
  location?: string;
  photo?: string;
}

export interface TeacherEarningOverview {
  teacherId: string;
  name: string;
  email: string;
  phone?: string;
  platformName?: string;
  totalEarningsInPaisa: number;
  totalEarningsInTaka: number;
  successPayments: number;
  lastApprovedAt: string | null;
}

export interface TeacherEarningDetails {
  teacher: {
    teacherId: string;
    name: string;
    email: string;
    phone?: string;
    platformName?: string;
    totalEarningsInPaisa: number;
    totalEarningsInTaka: number;
  };
  successPayments: number;
  paymentHistory: Array<{
    paymentId: string;
    approvedAt: string | null;
    studentName: string;
    examTitle: string;
    totalAmountInTaka: number;
    teacherAmountInTaka: number;
    platformAmountInTaka: number;
    method: string;
  }>;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingTeacherRequests: builder.query<TeacherRequest[], void>({
      query: () => '/admin/teachers/pending',
      providesTags: ['TeacherRequests'],
    }),
    getApprovedTeacherRequests: builder.query<TeacherRequest[], void>({
      query: () => '/admin/teachers/approved',
      providesTags: ['TeacherRequests'],
    }),
    getTeacherEarningsOverview: builder.query<TeacherEarningOverview[], void>({
      query: () => '/admin/teachers/earnings',
      providesTags: ['TeacherRequests'],
    }),
    getTeacherEarningsDetails: builder.query<TeacherEarningDetails, string>({
      query: (teacherId) => `/admin/teachers/${teacherId}/earnings`,
      providesTags: ['TeacherRequests'],
    }),
    approveTeacherRequest: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/teachers/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['TeacherRequests'],
    }),
    rejectTeacherRequest: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/teachers/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['TeacherRequests'],
    }),
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => '/admin/users',
      providesTags: ['Users'],
    }),
    activateUser: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/users/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
    deactivateUser: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/users/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
    createTeacherRequest: builder.mutation<unknown, CreateTeacherPayload>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          ...body,
          role: 'teacher',
        },
      }),
      invalidatesTags: ['TeacherRequests'],
    }),
  }),
});

export const {
  useGetPendingTeacherRequestsQuery,
  useGetApprovedTeacherRequestsQuery,
  useGetTeacherEarningsOverviewQuery,
  useGetTeacherEarningsDetailsQuery,
  useApproveTeacherRequestMutation,
  useRejectTeacherRequestMutation,
  useGetAdminUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useCreateTeacherRequestMutation,
} = adminApi;
