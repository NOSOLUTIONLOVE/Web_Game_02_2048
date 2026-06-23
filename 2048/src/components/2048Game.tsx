/**
 * 2048Game - 游戏挂载点 + GameEngine 生命周期
 *
 * 职责：
 * - 实例化 GameEngine（useEffect 内）
 * - 把 engine 的回调转发到 Zustand store
 * - 同步 audioEnabled / volume 到 engine
 * - 用 Context 暴露 engine 给子组件（HUD / Board / Overlays）
 * - 渲染 HUD + Board + Overlays
 * - v3.0：渲染开局倒计时遮罩
 *
 * 仿 snake 的 GameCanvas 模式。
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../store/useGameStore';
import { HUD } from './HUD';
import { Board } from './Board';
import { Overlays } from './Overlays';
import { Countdown } from './Countdown';

const EngineContext = createContext<GameEngine | null>(null);

/** 子组件中获取 engine 实例（必须在 2048Game 内使用） */
export function useEngine(): GameEngine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used within 2048Game');
  }
  return engine;
}

export function Game2048() {
  const [engine, setEngine] = useState<GameEngine | null>(null);

  // 实例化引擎
  useEffect(() => {
    const e = new GameEngine({
      onPhaseChange: (p) => useGameStore.getState().setPhase(p),
      onBoardChange: (snapshot) => useGameStore.getState().applyBoard(snapshot),
      onNewRecord: (highScore) => useGameStore.getState().setNewRecord(highScore),
      onStatsUpdate: (stats) => useGameStore.getState().updateStats(stats),
    });
    setEngine(e);
    e.start();

    return () => {
      e.stop();
      setEngine(null);
    };
  }, []);

  // 同步 audioEnabled 到 engine
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  useEffect(() => {
    if (engine) {
      engine.getAudio().setEnabled(audioEnabled);
    }
  }, [audioEnabled, engine]);

  // v3.0 同步音量到 engine
  const volume = useGameStore((s) => s.volume);
  useEffect(() => {
    if (engine) {
      engine.syncVolume(volume);
    }
  }, [volume, engine]);

  // 网格从 store 订阅
  const grid = useGameStore((s) => s.grid);
  const phase = useGameStore((s) => s.phase);
  // v3.0 倒计时显示值
  const countdown = useGameStore((s) => s.countdown);

  // 引擎未就绪时显示占位
  if (!engine) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <HUD />
        <div
          className="mx-auto board-bg rounded-lg shadow-2xl shadow-black/50 flex items-center justify-center"
          style={{ width: 360, height: 360 }}
        >
          <span className="text-white/60 text-sm">加载中…</span>
        </div>
      </div>
    );
  }

  return (
    <EngineContext.Provider value={engine}>
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <HUD />
        <div className="relative mx-auto">
          <Board grid={grid} />
          {/* v3.0 倒计时遮罩覆盖在 Board 上层，不阻挡交互 */}
          {countdown !== null && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <Countdown value={countdown} />
            </div>
          )}
          {/* 暂停/菜单遮罩覆盖在 Board 上层；won/over 用 Dialog 不阻塞方向键 */}
          {(phase === 'menu' || phase === 'paused') && (
            <div className="absolute inset-0 pointer-events-auto">
              <Overlays />
            </div>
          )}
        </div>
        {phase === 'won' && <Overlays />}
        {phase === 'over' && <Overlays />}
      </div>
    </EngineContext.Provider>
  );
}
