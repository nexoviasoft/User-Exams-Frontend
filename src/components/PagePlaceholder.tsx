import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PlaceholderPage({ title = "Page Under Construction" }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-text-secondary">This page is part of the PolyExamBuzz project setup and will be implemented soon.</p>
      </div>
    </DashboardLayout>
  );
}
