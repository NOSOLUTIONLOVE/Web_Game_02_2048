/**
 * WinModal - 胜利弹窗（达成 2048）
 *
 * 半透明遮罩覆盖在 Board 上层，**不阻断**方向键输入
 * 按钮：继续挑战（engine.keepPlaying）/ 重新开始
 *
 * 设计：达成 2048 后玩家可继续玩更高分
 */

import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, Play } from 'lucide-react';
import { useEngine } from './2048Game';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/button';

export function WinModal() {
  const engine = useEngine();
  const score = useGameStore((s) => s.score);
  const moves = useGameStore((s) => s.moves);
  const phase = useGameStore((s) => s.phase);

  if (phase !== 'won') return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 rounded-lg pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4 p-6 text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18 }}
      >
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          🎉
        </motion.div>

        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold text-primary text-glow">2048!</h2>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            恭喜达成 2048 · 继续挑战更高分
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Score
            </div>
            <div className="font-mono text-xl font-bold text-foreground tabular-nums">
              {score}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Steps
            </div>
            <div className="font-mono text-xl font-bold text-foreground tabular-nums">
              {moves}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[220px]">
          <Button onClick={() => engine.keepPlaying()}>
            <Play className="h-4 w-4 mr-2" />
            继续挑战
          </Button>
          <Button variant="outline" onClick={() => engine.startGame()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重新开始
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
