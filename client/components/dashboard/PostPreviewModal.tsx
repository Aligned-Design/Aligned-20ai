import { X } from "lucide-react";
import { Post, PLATFORM_ICONS, PLATFORM_NAMES } from "@/types/post";

interface PostPreviewModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostPreviewModal({ post, isOpen, onClose }: PostPreviewModalProps) {
  if (!isOpen || !post) return null;

  const Icon = PLATFORM_ICONS[post.platform] as React.ComponentType<{ className?: string }>;
  const platformName = PLATFORM_NAMES[post.platform];

  // Different preview layouts based on platform
  const getPreviewContent = () => {
    switch (post.platform) {
      case "linkedin":
        return (
          <div className="bg-white rounded-lg border border-slate-300 overflow-hidden w-full">
            {/* LinkedIn header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Your Company</p>
                      <p className="text-xs text-slate-600">
                        {post.brand || "Company Page"} • {post.scheduledDate || "Just now"}
                      </p>
                    </div>
                    <button className="text-slate-400 text-lg">•••</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-slate-900 text-sm leading-relaxed">{post.title}</p>
              <p className="text-slate-700 text-sm leading-relaxed">{post.excerpt}</p>
            </div>

            {/* Image */}
            <img
              src={`https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&h=300&fit=crop`}
              alt="preview"
              className="w-full"
            />

            {/* Engagement */}
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center gap-1 text-xs text-slate-600 mb-3">
                <span>👍 123</span>
                <span className="ml-auto">45 comments • 12 shares</span>
              </div>
              <div className="flex gap-0 text-slate-600 text-sm font-semibold">
                <button className="flex-1 py-2 hover:bg-slate-50 transition rounded">👍 Like</button>
                <button className="flex-1 py-2 hover:bg-slate-50 transition rounded">💬 Comment</button>
                <button className="flex-1 py-2 hover:bg-slate-50 transition rounded">↗️ Share</button>
              </div>
            </div>
          </div>
        );

      case "instagram":
        return (
          <div className="bg-white rounded-lg overflow-hidden border border-slate-300 w-full">
            {/* Instagram header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-sm text-slate-900">your_brand</p>
                  <p className="text-xs text-slate-600">Followed</p>
                </div>
              </div>
              <button className="text-slate-400 text-lg">•••</button>
            </div>

            {/* Image */}
            <div className="bg-slate-200 aspect-square overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop`}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="flex justify-between text-2xl mb-3">
                <div className="flex gap-3">
                  <button className="hover:opacity-70 transition">❤️</button>
                  <button className="hover:opacity-70 transition">💬</button>
                  <button className="hover:opacity-70 transition">➤</button>
                </div>
                <button className="hover:opacity-70 transition">🔖</button>
              </div>
              <p className="text-xs text-slate-600 mb-2">1,234 likes</p>
            </div>

            {/* Caption */}
            <div className="px-4 py-3 space-y-2">
              <div>
                <span className="font-bold text-sm text-slate-900">your_brand</span>
                <p className="text-sm text-slate-900 inline"> {post.title}</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{post.excerpt}</p>
              <button className="text-xs text-slate-500 font-semibold">View all 45 comments</button>
            </div>
          </div>
        );

      case "twitter":
        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 max-w-sm space-y-4">
            {/* Twitter header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                <div>
                  <p className="font-bold text-slate-900">Your Brand</p>
                  <p className="text-xs text-slate-600">@yourbrand</p>
                </div>
              </div>
              <span className="text-slate-600">•••</span>
            </div>

            {/* Content */}
            <p className="text-slate-900 text-sm">{post.title}</p>
            <p className="text-slate-700 text-sm">{post.excerpt}</p>

            {/* Image */}
            <img
              src={`https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop`}
              alt="preview"
              className="w-full rounded-2xl"
            />

            {/* Actions */}
            <div className="flex justify-between text-slate-600 text-xs pt-2 border-t">
              <button className="hover:text-blue-500">💬</button>
              <button className="hover:text-blue-500">🔄</button>
              <button className="hover:text-blue-500">❤️</button>
              <button className="hover:text-blue-500">���️</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-lg space-y-4">
            <p className="font-bold text-slate-900">{post.title}</p>
            <p className="text-slate-700">{post.excerpt}</p>
            <img
              src={`https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop`}
              alt="preview"
              className="w-full rounded-lg"
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-200/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
            <h2 className="text-xl font-black text-slate-900">
              {platformName} Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview content */}
        <div className="p-6 flex justify-center">
          <div className="w-full max-w-md">{getPreviewContent()}</div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-200/50 p-6 flex gap-3 justify-between">
          <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold transition-all">
            Edit Post
          </button>
          <button className="flex-1 px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-500 text-indigo-950 font-bold transition-all">
            Schedule Now
          </button>
        </div>
      </div>
    </div>
  );
}
