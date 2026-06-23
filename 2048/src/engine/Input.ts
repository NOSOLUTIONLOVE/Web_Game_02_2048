/**
 * Input - 2048 输入系统（键盘 + 触屏）
 *
 * 与 snake 的 Input.ts 同模式：纯回调绑定，不直接调用游戏逻辑
 */

import { CONFIG, type Direction } from '../config';

const TOUCH_THRESHOLD = CONFIG.TOUCH.THRESHOLD;

export interface InputCallbacks {
  onMove: (dir: Direction) => void;
  onUndo: () => void;
  onReset: () => void;
  onPause: () => void;
  onConfirm: () => void; // 菜单/结束界面按 Enter/Space
}

/** 2048 阶段：Input 仅做基础按键映射，是否消费由 GameEngine 决定 */
export class Input {
  private target: HTMLElement | Window = window;
  private callbacks: InputCallbacks | null = null;
  private touchStart: { x: number; y: number } | null = null;
  /** v3.0 禁用标志（页面隐藏时阻止输入） */
  private disabled: boolean = false;

  /** v3.0 设置禁用状态 */
  public setDisabled(b: boolean): void {
    this.disabled = b;
  }

  public bind(callbacks: InputCallbacks, target: HTMLElement | Window = window): void {
    this.unbind(); // 清理旧的
    this.callbacks = callbacks;
    this.target = target;

    // 键盘
    this.target.addEventListener('keydown', this.handleKeyDown as EventListener);

    // 触屏
    if (this.isHTMLElement(target)) {
      target.addEventListener('touchstart', this.handleTouchStart as EventListener, {
        passive: false,
      });
      target.addEventListener('touchmove', this.handleTouchMove as EventListener, {
        passive: false,
      });
      target.addEventListener('touchend', this.handleTouchEnd as EventListener, {
        passive: false,
      });
    }
  }

  public unbind(): void {
    this.target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    if (this.isHTMLElement(this.target)) {
      this.target.removeEventListener('touchstart', this.handleTouchStart as EventListener);
      this.target.removeEventListener('touchmove', this.handleTouchMove as EventListener);
      this.target.removeEventListener('touchend', this.handleTouchEnd as EventListener);
    }
    this.callbacks = null;
    this.touchStart = null;
  }

  // ============ 键盘 ============

  private handleKeyDown = (e: KeyboardEvent): void => {
    // v3.0 过滤按键重复事件
    if (e.repeat) return;
    // v3.0 禁用时忽略输入
    if (this.disabled) return;
    if (!this.callbacks) return;
    const key = e.key;

    // 方向
    const moveDir = this.keyToDirection(key);
    if (moveDir) {
      e.preventDefault();
      this.callbacks.onMove(moveDir);
      return;
    }

    // 撤销
    if (key === 'z' || key === 'Z' || (e.ctrlKey && key === 'z')) {
      e.preventDefault();
      this.callbacks.onUndo();
      return;
    }

    // 重置
    if (key === 'r' || key === 'R') {
      e.preventDefault();
      this.callbacks.onReset();
      return;
    }

    // 暂停
    if (key === 'p' || key === 'P' || key === 'Escape') {
      e.preventDefault();
      this.callbacks.onPause();
      return;
    }

    // 确认（菜单/结束界面进入游戏）
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      this.callbacks.onConfirm();
      return;
    }
  };

  private keyToDirection(key: string): Direction | null {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        return 'up';
      case 'ArrowDown':
      case 's':
      case 'S':
        return 'down';
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return 'left';
      case 'ArrowRight':
      case 'd':
      case 'D':
        return 'right';
      default:
        return null;
    }
  }

  // ============ 触屏 ============

  private handleTouchStart = (e: TouchEvent): void => {
    if (this.disabled) return;
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0]!;
    this.touchStart = { x: t.clientX, y: t.clientY };
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.disabled) return;
    // 阻止默认滚动行为
    if (this.touchStart) {
      e.preventDefault();
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (this.disabled) return;
    if (!this.callbacks || !this.touchStart) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - this.touchStart.x;
    const dy = t.clientY - this.touchStart.y;
    this.touchStart = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < TOUCH_THRESHOLD) return;

    let dir: Direction;
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    this.callbacks.onMove(dir);
  };

  // ============ 工具 ============

  private isHTMLElement(t: HTMLElement | Window): t is HTMLElement {
    return typeof (t as HTMLElement).addEventListener === 'function' && t !== window;
  }
}
