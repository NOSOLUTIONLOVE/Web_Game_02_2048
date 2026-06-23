/**
 * Overlays - 统一管理游戏状态遮罩
 *
 * 根据 phase 显示对应遮罩：
 * - menu: MainMenu
 * - paused: PauseOverlay
 * - over: GameOverModal
 * - won: WinModal
 * - countdown: 不显示任何遮罩（倒计时由 2048Game 直接渲染）
 *
 * v3.0：将 WinModal / GameOverModal 一并纳入 AnimatePresence，
 *       保证状态切换时进出动画一致
 */

import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { MainMenu } from './MainMenu';
import { PauseOverlay } from './PauseOverlay';
import { GameOverModal } from './GameOverModal';
import { WinModal } from './WinModal';

export function Overlays() {
  const phase = useGameStore((s) => s.phase);

  return (
    <AnimatePresence mode="wait">
      {phase === 'menu' && <MainMenu key="menu" />}
      {phase === 'paused' && <PauseOverlay key="paused" />}
      {phase === 'over' && <GameOverModal key="over" />}
      {phase === 'won' && <WinModal key="won" />}
    </AnimatePresence>
  );
}
