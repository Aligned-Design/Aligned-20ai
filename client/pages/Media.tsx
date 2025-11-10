import { MainLayout } from "@/components/layout/MainLayout";
import { AlertCircle } from "lucide-react";

export default function Media() {
  return (
    <MainLayout>
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4 inline-flex w-16 h-16 rounded-full bg-muted items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Media Library</h1>
          <p className="text-foreground/70 mb-6">
            This is a placeholder page. Feel free to continue prompting to fill in this page's contents with media management, asset organization, and more!
          </p>
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
}
