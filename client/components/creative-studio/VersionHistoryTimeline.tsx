/**
 * Version History Timeline
 * Shows design versions with restore capability
 */

import { useState } from "react";
import { History, RotateCcw, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Design } from "@/types/creativeStudio";

interface Version {
  id: string;
  versionNumber: number;
  designSnapshot: Design;
  createdBy: string;
  createdAt: string;
  changes: string;
  thumbnail?: string;
}

interface VersionHistoryTimelineProps {
  designId: string;
  currentVersion: number;
  onRestore: (versionId: string) => void;
  onPreview: (version: Version) => void;
}

export function VersionHistoryTimeline({
  designId,
  currentVersion,
  onRestore,
  onPreview,
}: VersionHistoryTimelineProps) {
  const [previewingVersion, setPreviewingVersion] = useState<Version | null>(null);

  // Mock versions - in production, fetch from API
  const versions: Version[] = [
    {
      id: "v3",
      versionNumber: 3,
      designSnapshot: {} as Design,
      createdBy: "You",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      changes: "Updated headline text and colors",
    },
    {
      id: "v2",
      versionNumber: 2,
      designSnapshot: {} as Design,
      createdBy: "Sarah Johnson",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      changes: "Added logo and adjusted layout",
    },
    {
      id: "v1",
      versionNumber: 1,
      designSnapshot: {} as Design,
      createdBy: "You",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      changes: "Initial design created",
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4" />
          Version History
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Current: v{currentVersion}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {versions.map((version, idx) => {
              const isCurrent = version.versionNumber === currentVersion;
              return (
                <div key={version.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 ${
                      isCurrent
                        ? "bg-purple-600 border-purple-200"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {isCurrent ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    )}
                  </div>

                  {/* Version Card */}
                  <div className="flex-1 pb-4">
                    <div
                      className={`p-3 rounded-lg border ${
                        isCurrent
                          ? "bg-purple-50 border-purple-200"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Version {version.versionNumber}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-purple-600 font-bold">
                                (Current)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(version.createdAt)} by{" "}
                            {version.createdBy}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 mb-3">
                        {version.changes}
                      </p>

                      {/* Thumbnail placeholder */}
                      <div className="w-full h-24 bg-slate-100 rounded border border-slate-200 mb-2 flex items-center justify-center">
                        <span className="text-xs text-slate-400">
                          Preview thumbnail
                        </span>
                      </div>

                      {/* Actions */}
                      {!isCurrent && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreview(version)}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRestore(version.id)}
                            className="flex-1"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
