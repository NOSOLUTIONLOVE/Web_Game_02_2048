/**
 * ErrorBoundary - 渲染异常兜底
 *
 * 职责：
 * - 捕获子组件渲染异常，避免整页白屏
 * - 显示友好错误提示与重试按钮
 * - 错误信息打印到 console 便于排查
 *
 * 设计：
 * - 类组件实现（React 唯一支持错误边界的方式）
 * - getDerivedStateFromError 切换错误态
 * - componentDidCatch 上报错误
 */

import { Component, type ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">出错了</h2>
            <p className="text-sm text-muted-foreground">游戏渲染异常，请重试</p>
          </div>
          <Button onClick={this.handleRetry}>重试</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
