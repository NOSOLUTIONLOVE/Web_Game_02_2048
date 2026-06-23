/**
 * SettingsPanel - 设置弹窗（v3.0）
 *
 * 可调项：
 * - 网格尺寸（4×4 / 5×5 / 6×6）—— 下一局生效
 * - 主题（经典暖色 / 暗夜霓虹 / 纯净极简）—— 立即生效
 * - 撤销次数上限（5 / 10 / 20）—— 下一局生效
 * - 音效开关 + 音量滑块（0-100）—— 立即生效
 *
 * 设计：
 * - 直接读写 store，不走 react-hook-form，保持简单
 * - 单选组用按钮行实现，选中态高亮
 * - 修改 gridSize / undoLimit 时显示"下一局生效"提示
 */

import { Volume2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { CONFIG, type GridSize, type ThemeName } from '../config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const setAudioEnabled = useGameStore((s) => s.setAudioEnabled);

  // v3.0 新增设置项
  const gridSize = useGameStore((s) => s.gridSize);
  const theme = useGameStore((s) => s.theme);
  const volume = useGameStore((s) => s.volume);
  const undoLimit = useGameStore((s) => s.undoLimit);
  const setGridSize = useGameStore((s) => s.setGridSize);
  const setTheme = useGameStore((s) => s.setTheme);
  const setVolume = useGameStore((s) => s.setVolume);
  const setUndoLimit = useGameStore((s) => s.setUndoLimit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>调整游戏偏好</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* 网格尺寸 */}
          <SettingRow
            title="网格尺寸"
            desc="下一局生效"
            hint
          >
            <div className="flex gap-2">
              {([4, 5, 6] as const).map((size) => (
                <Button
                  key={size}
                  variant={gridSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGridSize(size as GridSize)}
                  className="flex-1"
                >
                  {size}×{size}
                </Button>
              ))}
            </div>
          </SettingRow>

          <Separator />

          {/* 主题 */}
          <SettingRow title="主题" desc="立即生效">
            <div className="flex gap-2">
              {(Object.keys(CONFIG.THEMES) as ThemeName[]).map((key) => (
                <Button
                  key={key}
                  variant={theme === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(key)}
                  className="flex-1"
                >
                  {CONFIG.THEMES[key].name}
                </Button>
              ))}
            </div>
          </SettingRow>

          <Separator />

          {/* 撤销次数上限 */}
          <SettingRow
            title="撤销次数上限"
            desc="下一局生效"
            hint
          >
            <div className="flex gap-2">
              {CONFIG.UNDO_LIMITS.map((limit) => (
                <Button
                  key={limit}
                  variant={undoLimit === limit ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUndoLimit(limit)}
                  className="flex-1"
                >
                  {limit}
                </Button>
              ))}
            </div>
          </SettingRow>

          <Separator />

          {/* 音效开关 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">音效</div>
                <div className="text-xs text-muted-foreground">移动/合并/胜利音效</div>
              </div>
            </div>
            <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
          </div>

          {/* 音量滑块 */}
          <SettingRow title="音量" desc={`当前 ${volume}`}>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
              aria-label="音量"
            />
          </SettingRow>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 单行设置：左侧标题 + 描述，右侧控件 */
function SettingRow({
  title,
  desc,
  hint,
  children,
}: {
  title: string;
  desc?: string;
  /** 是否显示"下一局生效"提示徽章 */
  hint?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">{title}</div>
        {hint && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
            下一局生效
          </span>
        )}
      </div>
      {desc && !hint && (
        <div className="text-xs text-muted-foreground">{desc}</div>
      )}
      {children}
    </div>
  );
}
