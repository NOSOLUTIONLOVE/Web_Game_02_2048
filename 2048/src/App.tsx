/**
 * App - 根组件
 *
 * 布局：HUD + Board + Overlays（由 2048Game 内部组织） + Footer
 * v3.0：用 ErrorBoundary 兜底，并根据 store 中的 theme 应用页面背景/文字色
 */

import { useEffect } from 'react';
import { Game2048 } from './components/2048Game';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useGameStore } from './store/useGameStore';
import { CONFIG } from './config';

function App() {
  const theme = useGameStore((s) => s.theme);

  // 应用主题到 document root
  useEffect(() => {
    const themeConfig = CONFIG.THEMES[theme];
    document.documentElement.style.setProperty('--page-bg', themeConfig.pageBg);
    document.documentElement.style.setProperty('--page-text', themeConfig.pageText);
    document.body.style.backgroundColor = themeConfig.pageBg;
    document.body.style.color = themeConfig.pageText;
  }, [theme]);

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 gap-6"
        style={{ backgroundColor: 'var(--page-bg)', color: 'var(--page-text)' }}
      >
        <Game2048 />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
