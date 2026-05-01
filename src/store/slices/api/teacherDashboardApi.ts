import { baseApi } from './baseApi';

type TeacherEarningHistory = {
  paymentId: string;
  examTitle: string;
  studentName: string;
  teacherAmount: number;
  amountInTaka: number;
  method: string;
  approvedAt: string | null;
};

type TeacherEarningsResponse = {
  totalEarningsInPaisa: number;
  totalEarningsInTaka: number;
  paymentHistory: TeacherEarningHistory[];
};

export const teacherDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyQuestionBanks: builder.query<any[], void>({
      query: () => '/question-banks/my',
    }),
    getMySubjects: builder.query<any[], void>({
      query: () => '/subject',
    }),
    getMyModelTests: builder.query<any[], void>({
      query: () => '/modeltest',
    }),
    getMyEarnings: builder.query<TeacherEarningsResponse, void>({
      query: () => '/payments/my-earnings',
    }),
  }),
});

export const {
  useGetMyQuestionBanksQuery,
  useGetMySubjectsQuery,
  useGetMyModelTestsQuery,
  useGetMyEarningsQuery,
} = teacherDashboardApi;
