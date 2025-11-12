import { MainLayout } from "@/components/layout/MainLayout";
import { MultiClientApprovalDashboard } from "@/components/collaboration";

export default function ApprovalsEnhanced() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
        <div className="p-4 sm:p-6 md:p-8">
          <MultiClientApprovalDashboard />
        </div>
      </div>
    </MainLayout>
  );
}
