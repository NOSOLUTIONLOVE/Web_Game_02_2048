/**
 * useGameStore - Zustand 全局状态（v3.0）
 *
 * 桥接 UI 层（React）与游戏层（GameEngine）
 * - GameEngine 通过 actions 通知 UI 状态变化
 * - UI 通过订阅 phase / score / grid 渲染界面
 * - 持久化 highScore + audioEnabled + 设置项 + 统计到 localStorage
 * - v3.0 新增：网格尺寸 / 主题 / 音量 / 撤销限制 / 连击 / 倒计时 / 统计
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG, type GamePhase, type Grid, type GridSize, type ThemeName } from '../config';
import type { MoveResult } from '../engine/Board';
import { storage } from '../lib/storage';

/** 统计数据结构 */
interface GameStatistics {
  gamesPlayed: number;
  totalMoves: number;
  maxTile: number;
  bestPerMode: { 4: number; 5: number; 6: number };
}

interface GameStore {
  // ============ 状态 ============
  /** 当前游戏阶段 */
  phase: GamePhase;
  /** 当前 4×4 网格 */
  grid: Grid;
  /** 当前局分数 */
  score: number;
  /** 历史最高分 */
  highScore: number;
  /** 本局步数（V2 步数统计） */
  moves: number;
  /** 本局是否破纪录 */
  isNewRecord: boolean;
  /** 音效开关 */
  audioEnabled: boolean;
  /** 是否可撤销 */
  canUndo: boolean;
  /** 最近一次移动结果（用于动画驱动） */
  lastMove: MoveResult | null;

  // v3.0 新增状态
  /** 网格尺寸（4/5/6） */
  gridSize: GridSize;
  /** 当前主题 */
  theme: ThemeName;
  /** 音量（0-100） */
  volume: number;
  /** 撤销次数上限 */
  undoLimit: number;
  /** 当前连击倍数（0 = 无连击） */
  combo: number;
  /** 倒计时显示值（null = 未在倒计时） */
  countdown: number | null;
  /** 全局统计 */
  statistics: GameStatistics;
  /** 本局最高方块 */
  maxTileThisRound: number;

  // ============ actions（GameEngine 调用）============
  setPhase: (phase: GamePhase) => void;
  applyBoard: (snapshot: {
    grid: Grid;
    score: number;
    moves: number;
    canUndo: boolean;
    lastMove: MoveResult | null;
  }) => void;
  setNewRecord: (highScore: number) => void;

  // v3.0 新增 actions（GameEngine 调用）
  setCombo: (combo: number) => void;
  setCountdown: (n: number | null) => void;
  setMaxTileThisRound: (tile: number) => void;
  updateStats: (stats: { moves: number; maxTile: number; score: number; gridSize: number }) => void;

  // ============ actions（UI 调用）============
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetRound: () => void;

  // v3.0 新增 actions（UI 调用）
  setGridSize: (size: GridSize) => void;
  setTheme: (theme: ThemeName) => void;
  setVolume: (v: number) => void;
  setUndoLimit: (limit: number) => void;
}

/** 初始空网格 */
function createEmptyGrid(): Grid {
  return Array.from({ length: CONFIG.GRID.SIZE }, () =>
    Array<number | null>(CONFIG.GRID.SIZE).fill(null)
  );
}

/** 默认统计数据 */
function defaultStatistics(): GameStatistics {
  return {
    gamesPlayed: 0,
    totalMoves: 0,
    maxTile: 0,
    bestPerMode: { 4: 0, 5: 0, 6: 0 },
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // 初始状态
      phase: 'menu',
      grid: createEmptyGrid(),
      score: 0,
      highScore: storage.get<number>(CONFIG.STORAGE_KEY, 0),
      moves: 0,
      isNewRecord: false,
      audioEnabled: true,
      canUndo: false,
      lastMove: null,

      // v3.0 初始状态
      gridSize: 4,
      theme: 'classic',
      volume: 70,
      undoLimit: 10,
      combo: 0,
      countdown: null,
      statistics: defaultStatistics(),
      maxTileThisRound: 0,

      // GameEngine 回调
      setPhase: (phase) => set({ phase }),
      applyBoard: (snapshot) => set(snapshot),
      setNewRecord: (highScore) => set({ highScore, isNewRecord: true }),

      // v3.0 GameEngine 回调
      setCombo: (combo) => set({ combo }),
      setCountdown: (n) => set({ countdown: n }),
      setMaxTileThisRound: (tile) => set({ maxTileThisRound: tile }),
      updateStats: (stats) =>
        set((s) => ({
          statistics: {
            gamesPlayed: s.statistics.gamesPlayed + 1,
            totalMoves: s.statistics.totalMoves + stats.moves,
            maxTile: Math.max(s.statistics.maxTile, stats.maxTile),
            bestPerMode: {
              ...s.statistics.bestPerMode,
              [stats.gridSize as 4 | 5 | 6]: Math.max(
                s.statistics.bestPerMode[stats.gridSize as 4 | 5 | 6] ?? 0,
                stats.maxTile
              ),
            },
          },
        })),

      // UI 回调
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      resetRound: () =>
        set({
          score: 0,
          moves: 0,
          isNewRecord: false,
          lastMove: null,
          combo: 0,
          countdown: null,
          maxTileThisRound: 0,
        }),

      // v3.0 UI 回调
      setGridSize: (size) => set({ gridSize: size }),
      setTheme: (theme) => set({ theme }),
      setVolume: (v) => set({ volume: v }),
      setUndoLimit: (limit) => set({ undoLimit: limit }),
    }),
    {
      name: 'game2048:store',
      version: 2,
      // 持久化：最高分 + 音效开关 + v3.0 设置项 + 统计
      partialize: (s) => ({
        highScore: s.highScore,
        audioEnabled: s.audioEnabled,
        gridSize: s.gridSize,
        theme: s.theme,
        volume: s.volume,
        undoLimit: s.undoLimit,
        statistics: s.statistics,
      }),
      // v1 → v2 迁移：补充新字段
      migrate: (persistedState: unknown, version: number) => {
        const s = (persistedState as Partial<GameStore>) ?? {};
        if (version < 2) {
          return {
            ...s,
            gridSize: s.gridSize ?? 4,
            theme: s.theme ?? 'classic',
            volume: s.volume ?? 70,
            undoLimit: s.undoLimit ?? 10,
            statistics: s.statistics ?? defaultStatistics(),
          };
        }
        return s;
      },
    }
  )
);
