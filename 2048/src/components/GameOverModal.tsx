/**
 * GameOverModal - 游戏结束弹窗
 *
 * 用 Dialog 弹出（不影响 Board 操作）
 * 显示：标题 + Score / Best / Steps / Max Tile + NEW RECORD 徽章 + 按钮
 * v3.0：新增本局最大方块（Max Tile）展示
 */

import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy } from 'lucide-react';
import { useEngine } from './2048Game';
import { useGameStore } from '../store/useGameStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function GameOverModal() {
  const engine = useEngine();
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isNewRecord = useGameStore((s) => s.isNewRecord);
  const moves = useGameStore((s) => s.moves);
  // v3.0 本局最大方块
  const maxTileThisRound = useGameStore((s) => s.maxTileThisRound);
  const phase = useGameStore((s) => s.phase);

  const open = phase === 'over';

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-extrabold text-destructive">
              GAME OVER
            </DialogTitle>
            <DialogDescription>网格已满，无法继续移动</DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {isNewRecord && (
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Badge variant="success" className="text-sm px-3 py-1">
                  <Trophy className="h-3 w-3 mr-1" />
                  NEW RECORD!
                </Badge>
              </motion.div>
            )}

            {/* v3.0 四宫格统计：Score / Best / Steps / Max Tile */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Score
                </div>
                <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
                  {score}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Best
                </div>
                <div className="font-mono text-2xl font-bold text-accent tabular-nums">
                  {highScore}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Steps
                </div>
                <div className="font-mono text-2xl font-bold text-muted-foreground tabular-nums">
                  {moves}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Max Tile
                </div>
                <div className="font-mono text-2xl font-bold text-primary tabular-nums">
                  {maxTileThisRound || '-'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full" onClick={() => engine.startGame()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              再来一局
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => engine.backToMenu()}
            >
              <Home className="h-4 w-4 mr-2" />
              回主菜单
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
