import { AnalyticsInsight } from "@/types/analytics";
import { Sparkles, AlertCircle, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";

interface AnalyticsAdvisorProps {
  insights: AnalyticsInsight[];
}

export function AnalyticsAdvisor({ insights }: AnalyticsAdvisorProps) {
  const getTypeStyles = (type: AnalyticsInsight["type"]) => {
    switch (type) {
      case "opportunity":
        return {
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          iconColor: "text-emerald-600",
          badgeColor: "bg-emerald-100 text-emerald-700",
          icon: <Lightbulb className="w-5 h-5" />,
        };
      case "warning":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          badgeColor: "bg-amber-100 text-amber-700",
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case "suggestion":
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          badgeColor: "bg-blue-100 text-blue-700",
          icon: <TrendingUp className="w-5 h-5" />,
        };
    }
  };

  const getPriorityStyles = (priority: AnalyticsInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-orange-500";
      case "low":
      default:
        return "border-l-4 border-l-blue-500";
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 hover:bg-white/70 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-blue-50/20 to-transparent rounded-2xl -z-10"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-indigo-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-200/50 to-blue-200/40 backdrop-blur flex items-center justify-center border border-indigo-200/30 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Advisor Insights</h3>
            <p className="text-xs text-slate-500 font-medium">AI-powered performance analysis</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="relative space-y-3 mb-6">
        {insights.length > 0 ? (
          insights.slice(0, 5).map((insight, idx) => {
            const typeStyles = getTypeStyles(insight.type);
            const priorityStyles = getPriorityStyles(insight.priority);

            return (
              <div
                key={insight.id}
                className={`${typeStyles.bgColor} ${typeStyles.borderColor} ${priorityStyles} rounded-lg p-4 border transition-all duration-300 hover:shadow-sm animate-[fadeIn_300ms_ease-out] hover:translate-y-[-1px]`}
                style={{
                  animationDelay: `${idx * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`${typeStyles.iconColor} flex-shrink-0 mt-0.5`}>
                    {typeStyles.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {insight.title}
                      </h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${typeStyles.badgeColor}`}>
                        {insight.platform}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs font-medium mb-2 line-clamp-2">
                      {insight.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600 font-semibold">
                        {insight.metric}
                      </p>
                      <button className={`text-xs font-bold ${typeStyles.iconColor} hover:underline flex items-center gap-1 transition-all hover:scale-105`}>
                        {insight.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600 font-medium text-sm">No insights available yet</p>
            <p className="text-slate-500 text-xs mt-1">Check back after your next post</p>
          </div>
        )}
      </div>

      {/* Optimize Strategy CTA */}
      <button className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Optimize Strategy
      </button>
    </div>
  );
}
