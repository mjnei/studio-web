"use client";

import type { QueueStats } from "@/lib/types/queue";

interface QueueDistributionChartProps {
  queues: QueueStats[];
}

const CATEGORY_COLORS: Record<string, { bar: string; text: string; light: string }> = {
  tts: { bar: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" },
  video: { bar: "bg-purple-500", text: "text-purple-500", light: "bg-purple-500/10" },
  agnes: { bar: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-500/10" },
  system: { bar: "bg-gray-500", text: "text-gray-500", light: "bg-gray-500/10" },
};

export function QueueDistributionChart({ queues }: QueueDistributionChartProps) {
  // Calculate message counts by category
  const categoryStats: Record<
    string,
    { messageCount: number; queueCount: number; avgMessages: number }
  > = {};

  queues.forEach((queue) => {
    const category = queue.metadata?.category || "system";
    if (!categoryStats[category]) {
      categoryStats[category] = { messageCount: 0, queueCount: 0, avgMessages: 0 };
    }
    categoryStats[category].messageCount += queue.message_count;
    categoryStats[category].queueCount += 1;
  });

  // Calculate averages
  Object.keys(categoryStats).forEach((category) => {
    categoryStats[category].avgMessages = Math.round(
      categoryStats[category].messageCount / categoryStats[category].queueCount
    );
  });

  const totalMessages = Object.values(categoryStats).reduce(
    (sum, cat) => sum + cat.messageCount,
    0
  );

  // Sort by message count (descending)
  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].messageCount - a[1].messageCount)
    .slice(0, 4); // Show top 4 categories

  return (
    <div className="space-y-4">
      {sortedCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-body text-muted-foreground">No queue data available</p>
        </div>
      ) : (
        <>
          {/* Horizontal Bar Chart */}
          <div className="space-y-3">
            {sortedCategories.map(([category, stats]) => {
              const percentage = totalMessages > 0 ? (stats.messageCount / totalMessages) * 100 : 0;
              const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.system;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
                      <span className="text-body font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {stats.messageCount.toLocaleString()} msgs
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-caption text-muted-foreground">
                    <span>{percentage.toFixed(0)}%</span>
                    <span>{stats.queueCount} queue(s)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t">
            <div>
              <p className="text-caption text-muted-foreground">Total Messages</p>
              <p className="text-metric font-bold">{totalMessages.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Categories</p>
              <p className="text-metric font-bold">{Object.keys(categoryStats).length}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
