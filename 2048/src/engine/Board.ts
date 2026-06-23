/**
 * Board - 2048 核心网格逻辑（纯 TS，框架无关，v3.0）
 *
 * 负责：
 * - 网格状态管理（支持 4×4 / 5×5 / 6×6）
 * - 移动 / 合并算法
 * - 新方块生成（含唯一 tileId 追踪）
 * - 撤销栈（深度 ≤ 10）
 * - 胜负判定
 * - 连击计数
 *
 * 设计原则：
 * - 零 React / DOM 依赖
 * - 不可变风格（move 后返回新状态，不直接修改入参）
 * - 公开方法返回详细结果（合并位置、新方块位置、得分等），供 UI 做动画
 * - tileIds 与 grid 平行维护，用于方块动画追踪
 */

import { CONFIG, type Direction, type Grid, type CellValue, type GridSnapshot } from '../config';

export type BoardStatus = 'idle' | 'playing' | 'won' | 'over';

export interface MergeRecord {
  r: number;
  c: number;
  value: number;
  /** v3.0 合并后存活的方块 id（左侧方块保留） */
  survivedId?: number;
}

export interface MoveResult {
  changed: boolean;
  scoreGained: number;
  merged: MergeRecord[]; // 合并发生的位置 + 新值
  spawned: { r: number; c: number; value: number } | null; // 本次移动后生成的新方块
  won: boolean; // 本次移动是否触发胜利
  /** v3.0 本次移动的合并组数（用于连击计算） */
  combo: number;
}

export class Board {
  private size: number;
  private winValue: number;
  private grid: Grid;
  private history: GridSnapshot[] = [];
  private score: number = 0;
  private moves: number = 0;
  private status: BoardStatus = 'idle';
  private keepPlaying: boolean = false;
  private won: boolean = false;

  // v3.0 方块唯一标识追踪
  private nextId: number = 0;
  private tileIds: number[][];

  constructor(size: number = CONFIG.GRID.SIZE, winValue: number = CONFIG.SCORE.WIN_VALUE) {
    this.size = size;
    this.winValue = winValue;
    this.grid = this.createEmptyGrid();
    this.tileIds = this.createEmptyTileIds();
  }

  // ============ 公开只读访问 ============

  public getGrid(): Grid {
    return this.grid;
  }

  /** v3.0 获取方块 id 网格（-1 表示空格） */
  public getTileIds(): number[][] {
    return this.tileIds;
  }

  public getScore(): number {
    return this.score;
  }

  public getMoves(): number {
    return this.moves;
  }

  public getStatus(): BoardStatus {
    return this.status;
  }

  public hasWon(): boolean {
    return this.won;
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public getUndoCount(): number {
    return this.history.length;
  }

  // ============ 操作 ============

  /**
   * 重置棋盘（新游戏）
   * 初始生成 2 个随机方块
   */
  public reset(): void {
    this.grid = this.createEmptyGrid();
    this.tileIds = this.createEmptyTileIds();
    this.nextId = 0;
    this.history = [];
    this.score = 0;
    this.moves = 0;
    this.status = 'playing';
    this.keepPlaying = false;
    this.won = false;
    this.spawnRandom();
    this.spawnRandom();
  }

  /**
   * 移动 + 合并
   * 若方向上没有变化则返回 changed: false
   */
  public move(direction: Direction): MoveResult {
    if (this.status !== 'playing') {
      return { changed: false, scoreGained: 0, merged: [], spawned: null, won: false, combo: 0 };
    }

    // 1. 推入撤销快照
    this.pushHistory();

    // 2. 执行移动（同时处理 grid 与 tileIds）
    const {
      grid: newGrid,
      tileIds: newTileIds,
      score: gained,
      merged,
      combo,
    } = this.moveGrid(this.grid, this.tileIds, direction);

    // 检测是否真的变化
    const changed = !this.gridEquals(newGrid, this.grid);

    if (!changed) {
      // 没有变化，弹出快照，保持原状态
      this.history.pop();
      // 但仍要检测游戏是否已无路可走
      if (!this.canMoveAnyDirection()) {
        this.status = 'over';
      }
      return { changed: false, scoreGained: 0, merged: [], spawned: null, won: false, combo: 0 };
    }

    this.grid = newGrid;
    this.tileIds = newTileIds;
    this.score += gained;
    this.moves += 1;

    // 3. 检测胜利
    let justWon = false;
    if (!this.won && !this.keepPlaying) {
      if (merged.some((m) => m.value >= this.winValue)) {
        this.won = true;
        this.status = 'won';
        justWon = true;
      }
    }

    // 4. 生成新方块
    const spawned = this.spawnRandom();

    // 5. 检测游戏结束
    if (!this.canMoveAnyDirection()) {
      this.status = 'over';
    }

    return {
      changed: true,
      scoreGained: gained,
      merged,
      spawned,
      won: justWon,
      combo,
    };
  }

  /**
   * 撤销
   */
  public undo(): boolean {
    if (this.history.length === 0) return false;
    const snap = this.history.pop()!;
    this.grid = snap.grid;
    this.tileIds = snap.tileIds;
    this.score = snap.score;
    this.moves = snap.moves;
    // 撤销后状态重置为 playing（除非已 won）
    if (this.status === 'over') {
      this.status = this.canMoveAnyDirection() ? 'playing' : 'over';
    }
    return true;
  }

  /**
   * 胜利后选择继续挑战
   */
  public keepPlayingAfterWin(): void {
    if (this.status === 'won') {
      this.keepPlaying = true;
      this.status = 'playing';
    }
  }

  /** v3.0 追加额外分数（连击奖励） */
  public addScore(n: number): void {
    this.score += n;
  }

  // ============ 内部：移动算法 ============

  /**
   * 对整盘按方向移动
   * 内部统一转换为"向左"操作，再根据方向旋转
   * v3.0 同时处理 tileIds，保持与 grid 平行
   */
  private moveGrid(grid: Grid, tileIds: number[][], dir: Direction): {
    grid: Grid;
    tileIds: number[][];
    score: number;
    merged: MergeRecord[];
    combo: number;
  } {
    let workGrid = this.cloneGrid(grid);
    let workIds = this.cloneTileIds(tileIds);
    let totalScore = 0;
    const allMerged: MergeRecord[] = [];
    let combo = 0;

    // 旋转网格到 "向左" 方向（grid 与 tileIds 同步旋转）
    switch (dir) {
      case 'left':
        // 已经是 left
        break;
      case 'right':
        workGrid = this.rotateHorizontal(workGrid);
        workIds = this.rotateHorizontal(workIds);
        break;
      case 'up':
        workGrid = this.rotateCounterClockwise(workGrid);
        workIds = this.rotateCounterClockwise(workIds);
        break;
      case 'down':
        workGrid = this.rotateClockwise(workGrid);
        workIds = this.rotateClockwise(workIds);
        break;
    }

    // 对每行执行"向左合并"
    for (let r = 0; r < this.size; r++) {
      const { row, ids, score, merged } = this.moveRowLeft(workGrid[r]!, workIds[r]!);
      workGrid[r] = row;
      workIds[r] = ids;
      totalScore += score;
      // 连击组数 = 合并事件数
      combo += merged.length;
      // 合并坐标在旋转后的坐标系中，需要旋转回原坐标系
      for (const m of merged) {
        const { r: realR, c: realC } = this.toOriginalCoords(r, m.c, dir);
        allMerged.push({ r: realR, c: realC, value: m.value, survivedId: m.survivedId });
      }
    }

    // 旋转回原方向（与正向旋转互为逆）
    switch (dir) {
      case 'left':
        // 保持
        break;
      case 'right':
        workGrid = this.rotateHorizontal(workGrid);
        workIds = this.rotateHorizontal(workIds);
        break;
      case 'up':
        workGrid = this.rotateClockwise(workGrid);
        workIds = this.rotateClockwise(workIds);
        break;
      case 'down':
        workGrid = this.rotateCounterClockwise(workGrid);
        workIds = this.rotateCounterClockwise(workIds);
        break;
    }

    return { grid: workGrid, tileIds: workIds, score: totalScore, merged: allMerged, combo };
  }

  /**
   * 对一行执行"向左压缩 + 合并"
   * v3.0 同时处理 tileIds：合并时左侧方块 id 存活，右侧丢弃
   * 返回新行、新 id 行、得分、合并位置
   */
  private moveRowLeft(row: CellValue[], ids: number[]): {
    row: CellValue[];
    ids: number[];
    score: number;
    merged: MergeRecord[];
  } {
    // 1. 压缩（去除 null），同时压缩 ids
    const compressed: number[] = [];
    const compressedIds: number[] = [];
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== null) {
        compressed.push(row[i] as number);
        compressedIds.push(ids[i]!);
      }
    }

    const result: CellValue[] = [];
    const resultIds: number[] = [];
    let score = 0;
    const merged: MergeRecord[] = [];

    // 2. 合并相邻相同值
    let i = 0;
    while (i < compressed.length) {
      if (i + 1 < compressed.length && compressed[i] === compressed[i + 1]) {
        const sum = compressed[i]! * 2;
        result.push(sum);
        // 存活方块的 id（左侧方块保留）
        const survivedId = compressedIds[i]!;
        resultIds.push(survivedId);
        score += sum;
        // 合并发生位置是 result 的当前末尾（索引 = result.length - 1）
        merged.push({ r: 0, c: result.length - 1, value: sum, survivedId });
        i += 2;
      } else {
        result.push(compressed[i]);
        resultIds.push(compressedIds[i]!);
        i += 1;
      }
    }

    // 3. 末尾填充 null / -1
    while (result.length < this.size) {
      result.push(null);
      resultIds.push(-1);
    }

    return { row: result, ids: resultIds, score, merged };
  }

  // ============ 内部：新方块生成 ============

  /**
   * 在所有空格中随机选一个，90% 概率生成 2，10% 概率生成 4
   * v3.0 同时分配唯一 tileId
   */
  private spawnRandom(): { r: number; c: number; value: number } | null {
    const empties: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r]![c] === null) {
          empties.push({ r, c });
        }
      }
    }
    if (empties.length === 0) return null;

    const idx = Math.floor(Math.random() * empties.length);
    const cell = empties[idx]!;
    const value = Math.random() < CONFIG.SPAWN.PROB_TWO ? 2 : 4;

    this.grid[cell.r]![cell.c] = value;
    this.tileIds[cell.r]![cell.c] = this.nextId++;
    return { r: cell.r, c: cell.c, value };
  }

  // ============ 内部：胜负判定 ============

  /**
   * 任一方向上是否还有可移动 / 可合并的方块
   */
  private canMoveAnyDirection(): boolean {
    // 还有空格 → 可以移动
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r]![c] === null) return true;
      }
    }
    // 空格满，检查相邻是否有相同值
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const v = this.grid[r]![c];
        if (v === null) continue;
        // 右
        if (c + 1 < this.size && this.grid[r]![c + 1] === v) return true;
        // 下
        if (r + 1 < this.size && this.grid[r + 1]![c] === v) return true;
      }
    }
    return false;
  }

  // ============ 内部：撤销栈 ============

  private pushHistory(): void {
    const snap: GridSnapshot = {
      grid: this.cloneGrid(this.grid),
      tileIds: this.cloneTileIds(this.tileIds),
      score: this.score,
      moves: this.moves,
    };
    this.history.push(snap);
    // 限制栈深度
    if (this.history.length > CONFIG.HISTORY.MAX_SIZE) {
      this.history.shift();
    }
  }

  // ============ 工具方法 ============

  private createEmptyGrid(): Grid {
    return Array.from({ length: this.size }, () => Array<CellValue>(this.size).fill(null));
  }

  /** v3.0 创建空 tileIds 网格（-1 表示空格） */
  private createEmptyTileIds(): number[][] {
    return Array.from({ length: this.size }, () => Array<number>(this.size).fill(-1));
  }

  private cloneGrid(grid: Grid): Grid {
    return grid.map((row) => [...row]);
  }

  /** v3.0 克隆 tileIds 网格 */
  private cloneTileIds(ids: number[][]): number[][] {
    return ids.map((row) => [...row]);
  }

  private gridEquals(a: Grid, b: Grid): boolean {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (a[r]![c] !== b[r]![c]) return false;
      }
    }
    return true;
  }

  /** 顺时针旋转 90°（泛型，支持 Grid 与 tileIds） */
  private rotateClockwise<T>(grid: T[][]): T[][] {
    const result: T[][] = Array.from({ length: this.size }, () => new Array<T>(this.size));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        result[c]![this.size - 1 - r] = grid[r]![c]!;
      }
    }
    return result;
  }

  /** 逆时针旋转 90°（泛型，支持 Grid 与 tileIds） */
  private rotateCounterClockwise<T>(grid: T[][]): T[][] {
    const result: T[][] = Array.from({ length: this.size }, () => new Array<T>(this.size));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        result[this.size - 1 - c]![r] = grid[r]![c]!;
      }
    }
    return result;
  }

  /** 水平翻转（左右镜像，泛型，支持 Grid 与 tileIds） */
  private rotateHorizontal<T>(grid: T[][]): T[][] {
    const result: T[][] = Array.from({ length: this.size }, () => new Array<T>(this.size));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        result[r]![this.size - 1 - c] = grid[r]![c]!;
      }
    }
    return result;
  }

  /**
   * 将"已旋转为 left 方向"的坐标转换回原方向坐标
   * dir 为原始方向
   * rotatedR, rotatedC 是在 left 坐标系中的位置
   */
  private toOriginalCoords(
    rotatedR: number,
    rotatedC: number,
    dir: Direction
  ): { r: number; c: number } {
    // 不同方向的正向旋转矩阵：
    // left:  (R, C) → (R, C)
    // right: (R, C) → (R, S-1-C)        [horizontal flip]
    // up:    (R, C) → (S-1-C, R)        [rotateCounterClockwise]
    // down:  (R, C) → (C, S-1-R)        [rotateClockwise]
    //
    // 求逆（从 rotated 坐标回原坐标）：
    // left:  (r, c) → (r, c)
    // right: (r, c) → (r, S-1-c)
    // up:    (r, c) → (c, S-1-r)
    // down:  (r, c) → (S-1-c, r)
    switch (dir) {
      case 'left':
        return { r: rotatedR, c: rotatedC };
      case 'right':
        return { r: rotatedR, c: this.size - 1 - rotatedC };
      case 'up':
        return { r: rotatedC, c: this.size - 1 - rotatedR };
      case 'down':
        return { r: this.size - 1 - rotatedC, c: rotatedR };
    }
  }
}
