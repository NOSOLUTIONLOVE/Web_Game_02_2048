<div align="center">

# 2048 Web Game

> 经典 2048 数字合成游戏的现代 Web 实现，采用 React + TypeScript + Zustand 架构，支持多网格尺寸、主题切换、连击系统、撤销机制与音效合成。

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-brightgreen?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br />

[Live Demo](https://game-2048.vercel.app) · [Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [License](#-license)

</div>

---

## ✨ Features

### 🎮 Core Gameplay
- **Classic 2048 Mechanics** - Slide tiles in four directions to merge matching numbers
- **Multiple Grid Sizes** - Choose between 4×4 (classic), 5×5 (spacious), or 6×6 (challenge)
- **Dynamic Win Conditions** - Each grid size has its own target: 2048, 4096, or 8192
- **Continue After Winning** - Push beyond 2048 to chase higher scores

### 🎯 Advanced Mechanics
- **Undo System** - Up to 20 undo steps (configurable: 5/10/20)
- **Combo System** - Chain multiple merges in one move for score multipliers (1.5×, 2×, 3×)
- **High Score Persistence** - LocalStorage saves your best scores per grid size
- **Game Statistics** - Track games played, total moves, max tile achieved, and mode-specific records

### 🎨 Visual & Audio
- **Three Themes** - Classic Warm, Neon Dark, Minimal Light (instant switching)
- **Smooth Animations** - Framer Motion powers tile movements, merges, and spawns
- **Particle Effects** - DOM-based particle bursts on tile merges
- **Synthesized Sound Effects** - Web Audio API generates 6 distinct sounds (move/merge/spawn/win/lose/click)
- **Volume Control** - Adjustable 0-100% with persistent preference

### 📱 Accessibility & UX
- **Keyboard Controls** - Arrow keys, WASD, Z (undo), R (reset), P (pause), Space (start)
- **Touch Support** - Swipe gestures with 30px threshold to prevent accidental inputs
- **Pause System** - Pause/resume anytime, auto-pause on tab switch
- **Countdown Start** - 3-2-1-GO sequence before each game
- **Responsive Design** - Works on desktop and mobile devices
- **Screen Reader Support** - aria-live announcements for score changes

### 🛠 Technical Highlights
- **Three-Layer Architecture** - Engine (pure TS) / State (Zustand) / UI (React)
- **Zero Backend** - Fully static, localStorage for persistence
- **TypeScript Strict Mode** - Full type safety with Zod runtime validation
- **Unit Tested** - 16+ tests covering core algorithms (Vitest)
- **Performance Optimized** - <16ms move response, <30MB memory usage

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_02_2048.git
cd Web_Game_02_2048/2048

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://127.0.0.1:5174`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

Output: `dist/` directory (ready for static hosting)

---

## 📖 How to Play

### Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move tiles | ↑ ↓ ← → or W A S D | Swipe (30px min) |
| Undo | Z | - |
| Reset | R | - |
| Pause | P or Esc | - |
| Start/Confirm | Space or Enter | Tap button |

### Game Rules

1. **Slide** tiles in any of four directions
2. **Merge** tiles with the same number when they collide
3. **Score** points equal to the merged tile value (e.g., 2+2=4 scores 4 points)
4. **Win** by reaching the target tile (2048 for 4×4, 4096 for 5×5, 8192 for 6×6)
5. **Lose** when the grid is full and no merges are possible
6. **Combo** bonus: multiple merges in one move multiply your score

### Scoring

- Base score: sum of merged tiles
- Combo 2 (2 merges): 1.5× multiplier
- Combo 3 (3 merges): 2× multiplier
- Combo 4+ (4+ merges): 3× multiplier

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 | UI rendering |
| **Language** | TypeScript 5.4 | Type safety |
| **Build Tool** | Vite 5.2 | Fast HMR & bundling |
| **State Management** | Zustand 4.5 | Lightweight global state |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix | Accessible primitives |
| **Animation** | Framer Motion 11 | Layout animations |
| **Icons** | Lucide React | Consistent iconography |
| **Audio** | Web Audio API | Synthesized sound effects |
| **Testing** | Vitest 1.6 | Unit testing |
| **Validation** | Zod 3.23 | Runtime type checking |
| **Deployment** | Vercel | Static hosting |

---

## 🏗 Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────┐
│ UI Layer (React Components)             │
│  ├─ 2048Game (mount + Context)          │
│  ├─ Board / Tile / HUD / Overlays       │
│  └─ SettingsPanel                       │
│       ↕ useGameStore (subscribe)        │
├─────────────────────────────────────────┤
│ State Layer (Zustand)                   │
│  ├─ phase / grid / score / moves        │
│  ├─ highScore (persisted)               │
│  └─ actions (applyBoard, setPhase)      │
│       ↕ callbacks                       │
├─────────────────────────────────────────┤
│ Engine Layer (Pure TypeScript)          │
│  ├─ GameEngine (state machine)          │
│  ├─ Board (grid logic + undo)           │
│  ├─ Input (keyboard + touch)            │
│  └─ AudioSystem (Web Audio synthesis)   │
└─────────────────────────────────────────┘
```

### Key Design Patterns

- **State Machine** - 6 game phases: menu → countdown → playing → paused → won → over
- **Observer Pattern** - Engine callbacks decouple from store
- **Immutable Style** - Board.move() returns new state, enables undo
- **Context API** - Engine instance shared across components
- **Strategy Pattern** - CONFIG object for runtime parameters

### Core Algorithms

**Tile Movement** (rotation-based):
1. Rotate grid to "left" orientation
2. Compress row (remove nulls)
3. Merge adjacent matching tiles
4. Fill remaining with nulls
5. Rotate back to original orientation

**Undo System**:
- Deep copy grid + score + moves before each move
- Store up to 10-20 snapshots in history stack
- Pop snapshot to restore state

---

## 📦 Project Structure

```
2048/
├── docs/                    # Project documentation
│   ├── 01-项目立项.md
│   ├── 02-需求拆分.md
│   ├── 03-技术选型.md
│   ├── 04-项目架构.md
│   ├── 05-执行规划.md
│   └── 06-部署指南.md
│
├── src/
│   ├── config/              # Global config + Zod schemas
│   │   └── index.ts
│   │
│   ├── engine/              # Game engine (pure TS)
│   │   ├── Board.ts         # Grid logic + merge + undo
│   │   ├── GameEngine.ts    # State machine + orchestration
│   │   ├── Input.ts         # Keyboard + touch input
│   │   └── __tests__/       # Unit tests (16+ cases)
│   │
│   ├── lib/                 # Utilities
│   │   ├── audio.ts         # AudioSystem (Web Audio API)
│   │   ├── storage.ts       # localStorage wrapper
│   │   └── utils.ts         # cn() helper
│   │
│   ├── store/               # Zustand store
│   │   └── useGameStore.ts  # Global state + persistence
│   │
│   ├── components/          # UI components
│   │   ├── 2048Game.tsx     # Engine mount + Context
│   │   ├── Board.tsx        # Grid container + touch binding
│   │   ├── Tile.tsx         # Single tile + animations
│   │   ├── HUD.tsx          # Score bar + controls
│   │   ├── Overlays.tsx     # Phase-based overlays
│   │   ├── MainMenu.tsx     # Start screen + stats
│   │   ├── SettingsPanel.tsx # Grid/theme/audio settings
│   │   ├── Particles.tsx    # Merge particle effects
│   │   └── ui/              # shadcn/ui primitives
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
├── vercel.json              # Vercel deployment config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🎯 Features Breakdown

### Grid Sizes

| Size | Target | Difficulty | Strategy |
|------|--------|------------|----------|
| 4×4 | 2048 | Classic | Corner stacking |
| 5×5 | 4096 | Spacious | More room, higher target |
| 6×6 | 8192 | Challenge | Complex merges required |

### Themes

- **Classic Warm** - Traditional 2048 palette (#bbada0 board, warm tile colors)
- **Neon Dark** - Cyberpunk aesthetic (dark purple background, glowing accents)
- **Minimal Light** - Clean and bright (white background, subtle grays)

### Sound Effects

All synthesized via Web Audio API (no external files):

| Event | Waveform | Duration |
|-------|----------|----------|
| Move | Sine 800→400Hz | 0.05s |
| Merge | Triangle 200+value×8 Hz | 0.12s |
| Spawn | Sine 1200→600Hz | 0.03s |
| Win | Sine C5-E5-G5 (3 notes) | 0.3s×3 |
| Lose | Sawtooth 440→110Hz | 0.4s |
| Click | Sine 600Hz | 0.04s |

---

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Coverage includes:
- Tile movement algorithms (all 4 directions)
- Merge logic (single/multiple combos)
- Undo system (stack limits, state restoration)
- Win/lose conditions
- Grid size variations (4×4, 5×5, 6×6)
- Tile ID tracking (for animations)

---

## 📊 Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| JS bundle (gzip) | ≤200KB | 128KB ✅ |
| CSS bundle (gzip) | ≤10KB | 4.4KB ✅ |
| Total load | ≤500KB | 145KB ✅ |
| First render | ≤1s | <500ms ✅ |
| Move response | ≤50ms | <16ms ✅ |
| Memory usage | ≤50MB | <30MB ✅ |

---

## 🔒 Privacy & Security

- **Zero Data Collection** - No analytics, no tracking
- **Local Storage Only** - High scores and preferences stay on your device
- **No Third-Party Requests** - Fully self-contained
- **No Cookies** - localStorage used instead
- **XSS Protection** - Radix UI primitives prevent injection

---

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 100+ | ✅ |
| Edge | 100+ | ✅ |
| Firefox | 100+ | ✅ |
| Safari | 15+ | ✅ |
| iOS Safari | 15+ | ✅ |
| Android Chrome | 100+ | ✅ |

---

## 📚 Learn More

- [Original 2048 by Gabriele Cirulli](https://play2048.co/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Gabriele Cirulli** - Original 2048 game concept
- **shadcn/ui** - Beautiful component primitives
- **Radix UI** - Accessible uncontrolled components
- **Tailwind CSS** - Utility-first styling

---

<div align="center">

**Built with ❤️ using React + TypeScript + Zustand**

[Live Demo](https://game-2048.vercel.app) · [Report Bug](https://github.com/NOSOLUTIONLOVE/Web_Game_02_2048/issues) · [Request Feature](https://github.com/NOSOLUTIONLOVE/Web_Game_02_2048/issues)

</div>
