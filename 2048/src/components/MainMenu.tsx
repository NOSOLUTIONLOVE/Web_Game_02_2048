/**
 * MainMenu - 主菜单遮罩
 *
 * 显示：标题 + 开始按钮 + 操作说明 + 统计卡片
 * 覆盖在 Board 上层，不使用 Dialog 以避免方向键被吞
 * v3.0：底部追加 StatsCard 展示累计统计
 */

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEngine } from './2048Game';
import { Button } from './ui/button';
import { StatsCard } from './StatsCard';

export function MainMenu() {
  const engine = useEngine();

  const handleStart = () => {
    engine.startGame();
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 p-6 w-full max-w-sm"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center space-y-1">
          <h2 className="text-5xl font-extrabold tracking-widest text-primary text-glow">
            2048
          </h2>
          <p className="text-sm text-muted-foreground">经典数字合成 · v3.0</p>
        </div>

        <Button size="lg" onClick={handleStart} className="min-w-[180px]">
          <Play className="h-4 w-4 mr-2" />
          开始游戏
        </Button>

        <div className="text-center space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <Kbd>↑↓←→</Kbd>
            <span>/</span>
            <Kbd>WASD</Kbd>
            <span>移动</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Kbd>Z</Kbd>
            <span>撤销</span>
            <Kbd>R</Kbd>
            <span>重置</span>
            <Kbd>P</Kbd>
            <span>暂停</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Kbd>Space</Kbd>
            <span>开始 / 重开</span>
          </div>
        </div>

        {/* v3.0 统计卡片：仅在有过游戏记录时显示 */}
        <StatsCard />
      </motion.div>
    </motion.div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
      {children}
    </kbd>
  );
}
