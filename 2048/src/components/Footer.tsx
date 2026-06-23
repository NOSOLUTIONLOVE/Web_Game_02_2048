/**
 * Footer - 底部操作说明
 *
 * 列出所有键盘快捷键
 */

export function Footer() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
      <Item kbd="↑↓←→" label="移动" />
      <Item kbd="WASD" label="移动" />
      <Item kbd="Z" label="撤销" />
      <Item kbd="R" label="重置" />
      <Item kbd="P" label="暂停" />
      <Item kbd="Space" label="开始" />
    </div>
  );
}

function Item({ kbd, label }: { kbd: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
        {kbd}
      </kbd>
      {label}
    </span>
  );
}
