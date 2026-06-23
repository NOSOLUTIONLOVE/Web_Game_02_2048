/**
 * HUD - 顶部分数栏
 *
 * 显示：
 * - 左侧：2048 标题
 * - 右侧：Score / Best / Moves 三个数字方块（带弹动动画）
 * - NEW! 徽章（破纪录时）
 * - 音量切换 + 设置按钮
 * - v3.0：撤销按钮 + 连击徽章 + aria-live 无障碍播报
 */

import { useState } from 'react';
import { Settings, Volume2, VolumeX, Footprints, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useEngine } from './2048Game';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SettingsPanel } from './SettingsPanel';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isNewRecord = useGameStore((s) => s.isNewRecord);
  const moves = useGameStore((s) => s.moves);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  // v3.0 撤销与连击
  const canUndo = useGameStore((s) => s.canUndo);
  const combo = useGameStore((s) => s.combo);
  const engine = useEngine();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between w-full px-2 gap-2">
        {/* 左侧标题 */}
        <h1 className="text-4xl font-extrabold tracking-widest text-primary text-glow">
          2048
        </h1>

        {/* 右侧数字方块组 */}
        <div className="flex items-center gap-2">
          <NumberCard label="Score" value={score} accent="text-foreground" />
          <NumberCard label="Best" value={highScore} accent="text-accent" pulse={isNewRecord} />
          <NumberCard
            label="Steps"
            value={moves}
            accent="text-muted-foreground"
            icon={<Footprints className="h-3 w-3" />}
          />

          {isNewRecord && (
            <Badge variant="success" className="animate-scale-in">
              NEW!
            </Badge>
          )}

          {/* v3.0 连击徽章：combo > 1 时短暂闪现 */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                key={combo}
                initial={{ scale: 0.6, opacity: 0, y: -4 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.6, opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <Badge variant="success" className="font-mono">
                  COMBO ×{combo}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* v3.0 撤销按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => engine.undo()}
            disabled={!canUndo}
            aria-label="撤销"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          {/* 音量切换 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            aria-label={audioEnabled ? '关闭音效' : '开启音效'}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {/* 设置 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* v3.0 无障碍：分数变化时礼貌播报 */}
      <div className="sr-only" aria-live="polite">
        得分 {score} 分
      </div>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

interface NumberCardProps {
  label: string;
  value: number;
  accent: string;
  pulse?: boolean;
  icon?: React.ReactNode;
}

function NumberCard({ label, value, accent, pulse, icon }: NumberCardProps) {
  return (
    <div className="text-center px-3 py-1.5 rounded-lg bg-secondary/60 min-w-[64px]">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1 }}
        animate={
          pulse
            ? { scale: [1, 1.3, 1], color: ['#facc15', '#facc15', '#facc15'] }
            : { scale: [1, 1.25, 1] }
        }
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`font-mono text-base font-bold tabular-nums ${accent}`}
      >
        {value}
      </motion.div>
    </div>
  );
}
