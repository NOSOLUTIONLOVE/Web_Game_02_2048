/**
 * PauseOverlay - 暂停遮罩
 *
 * 半透明覆盖在 Board 上，显示"已暂停"和"继续"按钮
 */

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEngine } from './2048Game';
import { Button } from './ui/button';

export function PauseOverlay() {
  const engine = useEngine();

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4 p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-foreground text-glow">已暂停</h2>
        <p className="text-xs text-muted-foreground">
          按 <kbd className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">P</kbd> 或点击按钮继续
        </p>
        <Button size="lg" onClick={() => engine.togglePause()}>
          <Play className="h-4 w-4 mr-2" />
          继续
        </Button>
      </motion.div>
    </motion.div>
  );
}
