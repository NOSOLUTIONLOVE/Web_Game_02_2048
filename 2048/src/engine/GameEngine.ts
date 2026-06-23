/**
 * GameEngine - 编排层（v3.0，框架无关）
 *
 * 桥接 Board + Input + AudioSystem，对外通过 callbacks 通知 UI
 *
 * 阶段机：
 *   menu ──confirm──▶ countdown ──3-2-1-GO──▶ playing ──pause──▶ paused ──pause──▶ playing
 *                                                  │                                  │
 *                                                  ├─won (2048)──▶ won ──keepPlaying──▶ playing
 *                                                  │                  ──confirm──▶ countdown
 *                                                  └─over──▶ over ──confirm──▶ countdown
 *
 * v3.0 新增：
 * - 倒计时阶段（3-2-1-GO）
 * - 连击奖励（多组同时合并触发倍率）
 * - 统计回调（游戏结束时上报）
 * - 页面可见性监听（隐藏时禁用输入）
 * - 音量同步
 *
 * 设计要点：
 * - 不依赖 React / DOM（除 window / document 事件）
 * - 主循环极简：2048 是输入驱动游戏，无主动逻辑更新
 * - 持久化最高分到 localStorage
 */

import { CONFIG, type GamePhase, type Direction, type Grid } from '../config';
import { Board, type MoveResult } from './Board';
import { Input, type InputCallbacks } from './Input';
import { AudioSystem } from '../lib/audio';
import { storage } from '../lib/storage';
import { useGameStore } from '../store/useGameStore';

export interface BoardSnapshot {
  grid: Grid;
  score: number;
  moves: number;
  canUndo: boolean;
  lastMove: MoveResult | null;
}

export interface GameEngineCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onBoardChange: (snapshot: BoardSnapshot) => void;
  onNewRecord: (highScore: number) => void;
  /** v3.0 游戏结束统计回调 */
  onStatsUpdate?: (stats: { moves: number; maxTile: number; score: number; gridSize: number }) => void;
}

export class GameEngine {
  // 状态
  private phase: GamePhase = 'menu';
  private savedBest: number = 0;
  private lastMove: MoveResult | null = null;

  // v3.0 页面可见性
  private hidden: boolean = false;

  // 子系统
  private board: Board;
  private input: Input;
  private audio: AudioSystem;

  // 回调
  private callbacks: GameEngineCallbacks;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.savedBest = storage.get<number>(CONFIG.STORAGE_KEY, 0);

    // v3.0 根据 store 中的 gridSize 创建棋盘
    const gridSize = useGameStore.getState().gridSize;
    const winValue = CONFIG.GRID_SIZES[gridSize].winValue;
    this.board = new Board(gridSize, winValue);

    this.input = new Input();
    this.audio = new AudioSystem();

    // v3.0 同步初始音量
    const volume = useGameStore.getState().volume;
    this.audio.setVolume(volume / 100);

    // 绑定输入
    const inputCbs: InputCallbacks = {
      onMove: (dir) => this.handleMove(dir),
      onUndo: () => this.undo(),
      onReset: () => this.handleReset(),
      onPause: () => this.togglePause(),
      onConfirm: () => this.handleConfirm(),
    };
    this.input.bind(inputCbs, window);
  }

  // ============ 生命周期 ============

  public start(): void {
    // 唤醒音频（iOS Safari 兼容）
    this.audio.resume();
    // v3.0 监听页面可见性
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.notifyBoardChange();
    this.callbacks.onPhaseChange(this.phase);
  }

  public stop(): void {
    this.input.unbind();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // ============ 阶段切换 ============

  public startGame(): void {
    this.board.reset();
    this.lastMove = null;
    // v3.0 进入倒计时阶段
    this.phase = 'countdown';
    this.audio.playSpawn();
    this.notifyBoardChange();
    this.callbacks.onPhaseChange(this.phase);

    // 启动 3-2-1-GO 倒计时序列
    this.runCountdown(3);
  }

  /**
   * v3.0 倒计时序列：3 → 2 → 1 → 0(GO) → null + playing
   */
  private runCountdown(n: number): void {
    useGameStore.getState().setCountdown(n);
    setTimeout(() => {
      if (n > 0) {
        this.runCountdown(n - 1);
      } else {
        // GO 显示完毕，进入游戏
        useGameStore.getState().setCountdown(null);
        this.phase = 'playing';
        this.callbacks.onPhaseChange(this.phase);
      }
    }, 1000);
  }

  public togglePause(): void {
    if (this.phase === 'playing') {
      this.phase = 'paused';
      this.audio.playClick();
      this.callbacks.onPhaseChange(this.phase);
    } else if (this.phase === 'paused') {
      this.phase = 'playing';
      this.audio.playClick();
      this.callbacks.onPhaseChange(this.phase);
    }
  }

  public undo(): void {
    if (this.phase !== 'playing' && this.phase !== 'won') return;
    const ok = this.board.undo();
    if (ok) {
      this.lastMove = null;
      this.audio.playClick();
      this.notifyBoardChange();
    }
  }

  public keepPlaying(): void {
    if (this.phase !== 'won') return;
    this.board.keepPlayingAfterWin();
    this.phase = 'playing';
    this.callbacks.onPhaseChange(this.phase);
  }

  public backToMenu(): void {
    this.phase = 'menu';
    this.board.reset();
    this.lastMove = null;
    this.notifyBoardChange();
    this.callbacks.onPhaseChange(this.phase);
  }

  // ============ 公开 getter ============

  public getAudio(): AudioSystem {
    return this.audio;
  }

  public getInput(): Input {
    return this.input;
  }

  /** v3.0 获取方块 id 网格（供 UI 层用作稳定 React key） */
  public getTileIds(): number[][] {
    return this.board.getTileIds();
  }

  /** v3.0 页面是否隐藏 */
  public isHidden(): boolean {
    return this.hidden;
  }

  /** v3.0 同步音量（0-100 → 0-1） */
  public syncVolume(v: number): void {
    this.audio.setVolume(v / 100);
  }

  /** v3.0 当前撤销栈深度（已用撤销次数） */
  public getUndoCount(): number {
    return this.board.getUndoCount();
  }

  /**
   * 处理一次方向移动（供 UI 层触屏手势调用）
   * 与 Input 触发的 onMove 等价
   * v3.0 合并了原 handleMoveInternal 逻辑，并增加连击/统计
   */
  public handleMove(dir: Direction): void {
    // 倒计时阶段禁止移动
    if (this.phase !== 'playing') return;

    const result = this.board.move(dir);
    if (!result.changed) return;

    this.lastMove = result;
    this.audio.playMove();

    // v3.0 连击奖励计算
    let multiplier = 0;
    if (result.combo >= 4) {
      multiplier = 3;
    } else if (result.combo === 3) {
      multiplier = 2;
    } else if (result.combo === 2) {
      multiplier = 1.5;
    }

    if (multiplier > 0) {
      // 奖励 = 基础得分 × (倍率 - 1)
      const bonus = Math.round(result.scoreGained * (multiplier - 1));
      this.board.addScore(bonus);
      useGameStore.getState().setCombo(multiplier);
    } else {
      useGameStore.getState().setCombo(0);
    }

    if (result.merged.length > 0) {
      // 取最高合并值播放
      const maxVal = Math.max(...result.merged.map((m) => m.value));
      this.audio.playMerge(maxVal);
    }
    if (result.spawned) {
      // 稍微延迟 spawn 音效，与新方块动画同步
      setTimeout(() => this.audio.playSpawn(), 80);
    }

    // v3.0 更新本局最大方块
    const maxTile = this.getMaxTile();
    useGameStore.getState().setMaxTileThisRound(maxTile);

    // 破纪录
    if (this.board.getScore() > this.savedBest) {
      this.savedBest = this.board.getScore();
      storage.set(CONFIG.STORAGE_KEY, this.savedBest);
      this.callbacks.onNewRecord(this.savedBest);
    }

    // 状态切换
    const newStatus = this.board.getStatus();
    if (newStatus === 'won' && this.phase === 'playing') {
      this.phase = 'won';
      this.audio.playWin();
      this.callbacks.onPhaseChange(this.phase);
    } else if (newStatus === 'over' && this.phase === 'playing') {
      this.phase = 'over';
      this.audio.playLose();
      this.callbacks.onPhaseChange(this.phase);
      // v3.0 上报统计
      this.callbacks.onStatsUpdate?.({
        moves: this.board.getMoves(),
        maxTile: this.getMaxTile(),
        score: this.board.getScore(),
        gridSize: useGameStore.getState().gridSize,
      });
    }

    this.notifyBoardChange();
  }

  // ============ 内部 ============

  /** v3.0 页面可见性变化处理 */
  private handleVisibilityChange = (): void => {
    this.hidden = document.hidden;
    // 隐藏时禁用输入，避免后台误触
    this.input.setDisabled(this.hidden);
  };

  /** v3.0 扫描网格获取最大方块值 */
  private getMaxTile(): number {
    const grid = this.board.getGrid();
    let max = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell !== null && cell > max) max = cell;
      }
    }
    return max;
  }

  private handleReset(): void {
    if (this.phase === 'menu') return;
    this.startGame();
  }

  private handleConfirm(): void {
    if (this.phase === 'menu' || this.phase === 'over' || this.phase === 'won') {
      this.startGame();
    } else if (this.phase === 'paused') {
      this.togglePause();
    }
  }

  private notifyBoardChange(): void {
    this.callbacks.onBoardChange({
      grid: this.board.getGrid(),
      score: this.board.getScore(),
      moves: this.board.getMoves(),
      canUndo: this.board.canUndo(),
      lastMove: this.lastMove,
    });
  }
}
