/**
 * Board - 棋盘渲染（v3.0，支持 4×4 / 5×5 / 6×6 + 主题 + 响应式）
 *
 * 职责：
 * - 渲染 gridSize×gridSize 个空格槽（主题色）
 * - 渲染所有非空 Tile（绝对定位，基于 tileIds 稳定 key）
 * - 触屏手势绑定（绑定到本 DOM 节点，调用 engine.input 处理滑动）
 * - v3.0 响应式 cellSize（窗口 resize 时重算）
 * - v3.0 合并粒子 + 分数弹出 + 屏幕震动
 *
 * 设计：
 * - 尺寸来自 CONFIG.UI（GAP / PADDING）+ 动态 cellSize
 * - Tile 用 LayoutGroup + layout 实现移动/合并/生成动画
 * - tileIds 来自 engine，作为 React key 保证方块身份稳定
 * - 棋盘格用 grid 模板，Tile 浮在格子上方
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGroup, motion, useAnimationControls } from 'framer-motion';
import { CONFIG, type Direction, type Grid } from '../config';
import { Tile, getTileColor } from './Tile';
import { Particles } from './Particles';
import { ScorePopups } from './ScorePopup';
import { useEngine } from './2048Game';
import { useGameStore } from '../store/useGameStore';

/** 粒子爆发数据 */
interface ParticleBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

/** 分数弹出数据 */
interface ScorePopupData {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface BoardProps {
  /** 由 2048Game 传入的实际网格（store 中的 grid） */
  grid: Grid;
}

export function Board({ grid }: BoardProps) {
  const { GAP, PADDING } = CONFIG.UI;
  const engine = useEngine();
  const boardRef = useRef<HTMLDivElement>(null);

  // v3.0 从 store 订阅 gridSize / theme / lastMove
  const gridSize = useGameStore((s) => s.gridSize);
  const theme = useGameStore((s) => s.theme);
  const lastMove = useGameStore((s) => s.lastMove);

  // v3.0 响应式 cellSize
  const [cellSize, setCellSize] = useState<number>(CONFIG.UI.CELL_SIZE);
  useEffect(() => {
    const calc = () => {
      const maxBoard = 400;
      const padding = CONFIG.UI.PADDING;
      const gap = CONFIG.UI.GAP;
      const available = Math.min(window.innerWidth - 32, maxBoard);
      const size = Math.floor(
        (available - padding * 2 - gap * (gridSize - 1)) / gridSize
      );
      setCellSize(Math.min(80, Math.max(40, size)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [gridSize]);

  // v3.0 主题配色
  const themeConfig = CONFIG.THEMES[theme];

  // v3.0 粒子与分数弹出状态
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [popups, setPopups] = useState<ScorePopupData[]>([]);
  const popupIdRef = useRef(0);

  // v3.0 屏幕震动控制器
  const controls = useAnimationControls();

  // 触屏手势 → 通过 engine.input 转发
  useEffect(() => {
    const el = boardRef.current;
    if (!el || !engine) return;
    const input = engine.getInput();
    input.bind(
      {
        onMove: (dir: Direction) => engine.handleMove(dir),
        onUndo: () => engine.undo(),
        onReset: () => engine.startGame(),
        onPause: () => engine.togglePause(),
        onConfirm: () => engine.startGame(),
      },
      el
    );
    return () => input.unbind();
  }, [engine]);

  // v3.0 合并粒子 + 分数弹出 + 屏幕震动
  useEffect(() => {
    if (!lastMove?.merged || lastMove.merged.length === 0) return;
    const newBursts: ParticleBurst[] = [];
    const newPopups: ScorePopupData[] = [];
    for (const m of lastMove.merged) {
      const x = m.c * (cellSize + GAP) + cellSize / 2;
      const y = m.r * (cellSize + GAP) + cellSize / 2;
      const color = getTileColor(m.value).bg;
      newBursts.push({ id: popupIdRef.current++, x, y, color });
      newPopups.push({ id: popupIdRef.current++, x, y, value: m.value });
    }
    if (newBursts.length > 0) {
      setBursts((prev) => [...prev, ...newBursts]);
      setPopups((prev) => [...prev, ...newPopups]);
      // 动画结束后清理
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => !newBursts.includes(b)));
        setPopups((prev) => prev.filter((p) => !newPopups.includes(p)));
      }, 800);
    }
    // v3.0 大合并（≥128）触发屏幕震动
    const maxMerge = Math.max(...lastMove.merged.map((m) => m.value), 0);
    if (maxMerge >= 128) {
      controls.start({
        x: [0, -5, 5, -5, 5, 0],
        y: [0, -3, 3, -3, 3, 0],
        transition: { duration: 0.3 },
      });
    }
  }, [lastMove, cellSize, GAP, controls]);

  // v3.0 从 engine 获取 tileIds（用于稳定 key，grid 变化时重渲染即读取最新值）
  const tileIds = engine.getTileIds();

  // 棋盘外层总宽高（含 padding）
  const boardSize = gridSize * cellSize + (gridSize - 1) * GAP + PADDING * 2;
  const gridPxSize = gridSize * cellSize + (gridSize - 1) * GAP;

  // 构造非空 tile 列表（使用 tileIds 作为稳定 key）
  const tiles = useMemo(() => {
    const list: Array<{
      id: number;
      r: number;
      c: number;
      value: number;
      isMerged: boolean;
      isNew: boolean;
    }> = [];
    const mergedKeys = new Set(
      lastMove?.merged.map((m) => `${m.r}-${m.c}`) ?? []
    );
    const spawnedKey = lastMove?.spawned
      ? `${lastMove.spawned.r}-${lastMove.spawned.c}`
      : null;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const value = grid[r]?.[c];
        if (value === null || value === undefined) continue;
        const id = tileIds[r]?.[c] ?? -1;
        const isMerged = mergedKeys.has(`${r}-${c}`);
        const isNew = spawnedKey === `${r}-${c}` && !isMerged;
        list.push({ id, r, c, value, isMerged, isNew });
      }
    }
    return list;
  }, [grid, tileIds, lastMove, gridSize]);

  return (
    <motion.div
      animate={controls}
      ref={boardRef}
      className="relative rounded-lg shadow-2xl shadow-black/50 touch-none select-none"
      style={{
        width: boardSize,
        height: boardSize,
        padding: PADDING,
        backgroundColor: themeConfig.boardBg,
      }}
    >
      {/* 空格槽（静态） */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: GAP,
          width: gridPxSize,
          height: gridPxSize,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <div
            key={i}
            className="rounded-md"
            style={{ backgroundColor: themeConfig.empty }}
          />
        ))}
      </div>

      {/* 浮层 Tile 区域 */}
      <div
        className="absolute"
        style={{
          top: PADDING,
          left: PADDING,
          width: gridPxSize,
          height: gridPxSize,
        }}
      >
        <LayoutGroup>
          {tiles.map((t) => (
            <Tile
              key={t.id}
              id={t.id}
              r={t.r}
              c={t.c}
              value={t.value}
              cellSize={cellSize}
              isMerged={t.isMerged}
              isNew={t.isNew}
            />
          ))}
        </LayoutGroup>

        {/* v3.0 粒子效果 */}
        <Particles bursts={bursts} />
        {/* v3.0 分数弹出 */}
        <ScorePopups popups={popups} />
      </div>
    </motion.div>
  );
}
