import { baseApi } from './baseApi';

export interface ExamType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const examTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExamTypes: builder.query<ExamType[], void>({
      query: () => '/examtype',
      providesTags: ['ExamTypes'],
    }),
    createExamType: builder.mutation<ExamType, { name: string; description: string }>({
      query: (body) => ({
        url: '/examtype',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamTypes'],
    }),
    updateExamType: builder.mutation<ExamType, { id: string; name: string; description: string }>({
      query: ({ id, ...body }) => ({
        url: `/examtype/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ExamTypes'],
    }),
    deleteExamType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/examtype/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamTypes'],
    }),
  }),
});

export const {
  useGetExamTypesQuery,
  useCreateExamTypeMutation,
  useUpdateExamTypeMutation,
  useDeleteExamTypeMutation,
} = examTypesApi;
