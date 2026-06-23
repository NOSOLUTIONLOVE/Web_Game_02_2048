/**
 * StatsCard - 统计概览卡片
 *
 * 职责：
 * - 主菜单展示累计游戏次数、累计步数、最高方块
 * - 展示各模式（4×4 / 5×5 / 6×6）最高分
 * - 仅在 gamesPlayed > 0 时显示
 *
 * 设计：
 * - 从 useGameStore 读取 statistics
 * - 紧凑网格布局，配合 lucide-react 图标
 * - 暗色主题配色（bg-secondary/50, text-muted-foreground）
 */

import { useGameStore } from '../store/useGameStore';
import { Gamepad2, Footprints, Crown } from 'lucide-react';

export function StatsCard() {
  const statistics = useGameStore((s) => s.statistics);

  // 无游戏记录则不显示
  if (statistics.gamesPlayed === 0) return null;

  const { gamesPlayed, totalMoves, maxTile, bestPerMode } = statistics;

  return (
    <div className="w-full rounded-lg bg-secondary/50 border border-border p-4 space-y-3">
      {/* 顶部三项核心统计 */}
      <div className="grid grid-cols-3 gap-2">
        <StatItem
          icon={<Gamepad2 className="h-4 w-4" />}
          label="游戏次数"
          value={gamesPlayed}
        />
        <StatItem
          icon={<Footprints className="h-4 w-4" />}
          label="累计步数"
          value={totalMoves}
        />
        <StatItem
          icon={<Crown className="h-4 w-4" />}
          label="最高方块"
          value={maxTile}
        />
      </div>

      {/* 各模式最高分 */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">各模式最高分</p>
        <div className="grid grid-cols-3 gap-2">
          <ModeBest label="4×4" value={bestPerMode[4]} />
          <ModeBest label="5×5" value={bestPerMode[5]} />
          <ModeBest label="6×6" value={bestPerMode[6]} />
        </div>
      </div>
    </div>
  );
}

/** 单项统计（图标 + 标签 + 数值） */
function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

/** 单模式最高分 */
function ModeBest({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md bg-background/40 py-1.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {value || '-'}
      </span>
    </div>
  );
}
