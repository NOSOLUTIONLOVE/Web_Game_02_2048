/**
 * Board 单元测试 - 覆盖移动/合并/撤销/胜负等核心算法
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../Board';
import type { Grid } from '../../config';

/** 构造一个指定网格（深拷贝） */
function gridFromArray(rows: number[][]): Grid {
  return rows.map((row) => row.map((v) => (v === 0 ? null : v)));
}

/** v3.0 构造网格并同步初始化 tileIds（-1 表示空格，递增 id 表示有方块） */
function setGridWithIds(board: Board, rows: number[][]) {
  const b = board as unknown as { grid: Grid; tileIds: number[][]; nextId: number };
  let nextId = b.nextId;
  const grid: Grid = [];
  const tileIds: number[][] = [];
  for (const row of rows) {
    const gridRow: (number | null)[] = [];
    const idsRow: number[] = [];
    for (const v of row) {
      if (v === 0) {
        gridRow.push(null);
        idsRow.push(-1);
      } else {
        gridRow.push(v);
        idsRow.push(nextId++);
      }
    }
    grid.push(gridRow);
    tileIds.push(idsRow);
  }
  b.grid = grid;
  b.tileIds = tileIds;
  b.nextId = nextId;
}

describe('Board - moveRowLeft 核心算法', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
    board.reset(); // status 设为 'playing'
  });

  it('初始状态：4×4 全空（reset 前）', () => {
    const fresh = new Board();
    const grid = fresh.getGrid();
    expect(grid).toHaveLength(4);
    grid.forEach((row) => {
      expect(row).toHaveLength(4);
      row.forEach((cell) => expect(cell).toBeNull());
    });
  });

  it('reset 后有 2 个随机方块', () => {
    // beforeEach 已 reset
    const grid = board.getGrid();
    let nonEmpty = 0;
    grid.forEach((row) => row.forEach((c) => c !== null && nonEmpty++));
    expect(nonEmpty).toBe(2);
  });

  it('向左合并：2 + 2 = 4', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(b.grid[0]![0]).toBe(4);
    expect(board.getScore()).toBe(4);
  });

  it('向左合并：4 + 4 + 4 + 4 → 8 + 8', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [4, 4, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.scoreGained).toBe(16);
    // 移动后会生成新方块
    expect(b.grid[0]![0]).toBe(8);
    expect(b.grid[0]![1]).toBe(8);
  });

  it('向左：一次只合并一次（2+2+4+4 → 4+8）', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.scoreGained).toBe(12); // 4 + 8
    // 注意：move() 后会生成一个新方块，所以只需检查 [0] 和 [1] 位置
    expect(b.grid[0]![0]).toBe(4);
    expect(b.grid[0]![1]).toBe(8);
  });

  it('向右合并：2 + 2 + 4 → 4 + 4', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [0, 0, 0, 0],
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('right');
    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(4); // 仅 2+2 合并得 4 分
    // 移动后会生成新方块，只检查已知位置
    expect(b.grid[1]![2]).toBe(4);
    expect(b.grid[1]![3]).toBe(4);
  });

  it('向上合并：列合并', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('up');
    expect(result.scoreGained).toBe(4);
    expect(b.grid[0]![0]).toBe(4);
  });

  it('向下合并：列合并', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('down');
    expect(result.scoreGained).toBe(4);
    expect(b.grid[3]![0]).toBe(4);
  });

  it('无变化时返回 changed: false 且不入栈', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    const result = board.move('left');
    expect(result.changed).toBe(false);
    expect(board.canUndo()).toBe(false);
  });
});

describe('Board - 撤销', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
    board.reset();
  });

  it('一次移动后可以撤销', () => {
    const b = board as unknown as { grid: Grid };
    const before = b.grid.map((row) => [...row]);
    board.move('left');
    expect(board.canUndo()).toBe(true);
    const ok = board.undo();
    expect(ok).toBe(true);
    expect(b.grid).toEqual(before);
  });

  it('无操作时撤销返回 false', () => {
    expect(board.canUndo()).toBe(false);
    const ok = board.undo();
    expect(ok).toBe(false);
  });

  it('撤销栈最多 10 步', () => {
    for (let i = 0; i < 15; i++) {
      board.move('left');
    }
    expect(board.canUndo()).toBe(true);
    // 撤销 10 次后栈应空
    for (let i = 0; i < 10; i++) {
      board.undo();
    }
    expect(board.canUndo()).toBe(false);
  });
});

describe('Board - 胜负判定', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
    board.reset();
  });

  it('达到 2048 时进入 won 状态', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(true);
    expect(board.getStatus()).toBe('won');
  });

  it('keepPlayingAfterWin 后再合并 2048+ 不再触发 won', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    board.move('left');
    expect(board.getStatus()).toBe('won');
    board.keepPlayingAfterWin();
    expect(board.getStatus()).toBe('playing');
    // 第二次合并 2048 → 4096
    b.grid = gridFromArray([
      [2048, 2048, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(false);
  });

  it('网格满且无可合并时进入 over 状态', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    board.move('left'); // 无变化
    expect(board.getStatus()).toBe('over');
  });

  it('网格满但有可合并时仍为 playing', () => {
    const b = board as unknown as { grid: Grid };
    b.grid = gridFromArray([
      [2, 2, 4, 8],
      [4, 8, 2, 4],
      [2, 4, 8, 2],
      [4, 2, 4, 8],
    ]);
    board.move('left'); // 第一行 2+2=4
    expect(board.getStatus()).toBe('playing');
  });
});

describe('Board v3.0 - 可变网格尺寸', () => {
  it('5×5 网格初始化', () => {
    const board = new Board(5, 4096);
    board.reset();
    const grid = board.getGrid();
    expect(grid).toHaveLength(5);
    grid.forEach((row) => expect(row).toHaveLength(5));
  });

  it('6×6 网格初始化', () => {
    const board = new Board(6, 8192);
    board.reset();
    const grid = board.getGrid();
    expect(grid).toHaveLength(6);
    grid.forEach((row) => expect(row).toHaveLength(6));
  });

  it('5×5 向左合并', () => {
    const board = new Board(5, 4096);
    board.reset();
    setGridWithIds(board, [
      [2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(4);
    const grid = board.getGrid();
    expect(grid[0]![0]).toBe(4);
  });

  it('6×6 向右合并', () => {
    const board = new Board(6, 8192);
    board.reset();
    setGridWithIds(board, [
      [0, 0, 0, 0, 2, 2],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
    const result = board.move('right');
    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(4);
    const grid = board.getGrid();
    expect(grid[0]![5]).toBe(4);
  });
});

describe('Board v3.0 - 连击 Combo', () => {
  it('单组合并 combo = 1', () => {
    const board = new Board();
    board.reset();
    setGridWithIds(board, [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.combo).toBe(1);
  });

  it('两组同时合并 combo = 2', () => {
    const board = new Board();
    board.reset();
    setGridWithIds(board, [
      [2, 2, 0, 0],
      [4, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.combo).toBe(2);
  });

  it('四组同时合并 combo = 4', () => {
    const board = new Board();
    board.reset();
    setGridWithIds(board, [
      [2, 2, 0, 0],
      [4, 4, 0, 0],
      [8, 8, 0, 0],
      [16, 16, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.combo).toBe(4);
  });

  it('无合并时 combo = 0', () => {
    const board = new Board();
    board.reset();
    setGridWithIds(board, [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.combo).toBe(0);
  });
});

describe('Board v3.0 - 动态 WIN_VALUE', () => {
  it('4×4 达到 2048 触发胜利', () => {
    const board = new Board(4, 2048);
    board.reset();
    setGridWithIds(board, [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(true);
  });

  it('5×5 达到 2048 不触发胜利（目标 4096）', () => {
    const board = new Board(5, 4096);
    board.reset();
    setGridWithIds(board, [
      [1024, 1024, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(false);
  });

  it('5×5 达到 4096 触发胜利', () => {
    const board = new Board(5, 4096);
    board.reset();
    setGridWithIds(board, [
      [2048, 2048, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(true);
  });

  it('6×6 达到 8192 触发胜利', () => {
    const board = new Board(6, 8192);
    board.reset();
    setGridWithIds(board, [
      [4096, 4096, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
    const result = board.move('left');
    expect(result.won).toBe(true);
  });
});

describe('Board v3.0 - 方块 id 追踪', () => {
  it('reset 后 tileIds 与 grid 一致', () => {
    const board = new Board();
    board.reset();
    const grid = board.getGrid();
    const tileIds = board.getTileIds();
    expect(tileIds).toHaveLength(4);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r]![c] !== null) {
          expect(tileIds[r]![c]).toBeGreaterThanOrEqual(0);
        } else {
          expect(tileIds[r]![c]).toBe(-1);
        }
      }
    }
  });

  it('移动后方块 id 保持稳定（不重生成）', () => {
    const board = new Board();
    board.reset();
    setGridWithIds(board, [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const idsBefore = board.getTileIds();
    const tileIdBefore = idsBefore[0]![0];
    // 向右移动
    board.move('right');
    const idsAfter = board.getTileIds();
    // 原方块应出现在 (0, 3) 位置，id 不变
    expect(idsAfter[0]![3]).toBe(tileIdBefore);
  });
});
