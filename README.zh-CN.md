<div align="center">

# 🎮 2048 网页游戏

> 经典 2048 数字合成游戏的现代 Web 实现，采用 React + TypeScript + Zustand 架构，支持多网格尺寸、主题切换、连击系统、撤销机制与音效合成。

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Web_Game_02_2048-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NOSOLUTIONLOVE/Web_Game_02_2048)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-brightgreen?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**[English](README.md)** · **[中文](README.zh-CN.md)**

<br />

[在线体验](#-在线体验) · [功能特性](#-功能特性) · [快速开始](#-快速开始) · [架构设计](#-架构设计) · [游戏说明](#-游戏说明) · [项目结构](#-项目结构) · [性能指标](#-性能指标) · [技术栈](#-技术栈) · [开源协议](#-开源协议)

</div>

---

## 🌟 项目概述

本项目是经典 2048 数字合成游戏的完整 Web 实现，作为个人作品集项目（Web_Game 系列 #2）开发。项目从零开始设计并实现，涵盖产品需求分析、技术选型、架构设计、核心算法、UI 交互、音效系统、单元测试到生产部署的完整工程链路。

**核心亮点**：
- 基于 **三层架构**（Engine / State / UI）实现关注点分离，游戏引擎零 React 依赖，可独立测试与复用
- 支持 **三种网格尺寸**（4x4 / 5x5 / 6x6）与 **三种主题**（经典暖色 / 暗夜霓虹 / 纯净极简），满足不同难度与审美偏好
- 自研 **连击奖励系统** 与 **撤销机制**，配合 Web Audio API 合成的 6 种音效，提供丰富的游戏反馈
- 全链路 TypeScript 严格模式 + Zod 运行时校验，16+ 单元测试覆盖核心算法
- 纯静态部署，零后端依赖，localStorage 持久化所有用户偏好与统计数据

### 项目文档

本项目包含完整的工程文档，记录了从立项到部署的全过程：

| 文档 | 内容 |
|------|------|
| [PRD-2048](PRD-2048.md) | 产品需求文档 — 背景、目标用户、核心玩法、功能需求、验收标准 |
| [01 - 项目立项](2048/docs/01-项目立项.md) | 立项书 — 项目定位、技术约束、风险评估 |
| [02 - 需求拆分](2048/docs/02-需求拆分.md) | 任务清单 — MVP 与 V2 扩展功能拆解 |
| [03 - 技术选型](2048/docs/03-技术选型.md) | 技术决策 — 渲染方案、状态管理、动画、音效等选型对比 |
| [04 - 项目架构](2048/docs/04-项目架构.md) | 代码组织 — 三层架构设计、模块详解、数据流图、设计模式 |
| [05 - 执行规划](2048/docs/05-执行规划.md) | 迭代计划 — 分阶段开发目标与里程碑 |
| [06 - 部署指南](2048/docs/06-部署指南.md) | 部署方案 — Vercel 配置、缓存策略、安全头 |

---

## 🎮 在线体验

**在线试玩：** [https://game-2048.vercel.app](https://game-2048.vercel.app)

> 💡 提示：支持桌面端键盘操作和移动端触屏滑动，推荐在桌面端获得最佳体验。

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆仓库
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_02_2048.git
cd Web_Game_02_2048/2048

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

游戏将在 `http://127.0.0.1:5174` 打开

### 生产构建

```bash
npm run build
npm run preview  # 预览生产构建
```

输出：`dist/` 目录（可直接用于静态托管）

---

## 🏛️ 架构设计

### 三层架构

```
┌─────────────────────────────────────────────┐
│  UI 层（React 组件）                         │
│  ├─ 2048Game（挂载点 + Context）             │
│  ├─ Board / Tile / HUD / Overlays           │
│  ├─ SettingsPanel                           │
│       │ useGameStore（订阅）                 │
└─────────────────────┬───────────────────────┘
                      │ read/write
┌─────────────────────▼───────────────────────┐
│  State 层（Zustand）                         │
│  ├─ phase / grid / score / moves            │
│  ├─ highScore（持久化）                      │
│  ├─ actions（applyBoard, setPhase）          │
│       │ callbacks                           │
└─────────────────────┬───────────────────────┘
                      │ subscribe / dispatch
┌─────────────────────▼───────────────────────┐
│  Engine 层（纯 TypeScript）                  │
│  ├─ GameEngine（状态机）                     │
│  ├─ Board（网格逻辑 + 撤销）                 │
│  ├─ Input（键盘 + 触屏）                     │
│  ├─ AudioSystem（Web Audio 合成）            │
└─────────────────────────────────────────────┘
```

### 核心设计模式

- **状态机** — 6 个游戏阶段：menu -> countdown -> playing -> paused -> won -> over
- **观察者模式** — Engine 通过回调通知 Store，实现解耦
- **不可变风格** — Board.move() 返回新状态，天然支持撤销
- **Context API** — Engine 实例跨组件共享
- **策略模式** — CONFIG 对象实现运行时参数化

### 核心算法

**方块移动**（基于旋转）：
1. 将网格旋转至「向左」方向
2. 压缩行（移除空值）
3. 合并相邻相同值的方块
4. 用空值填充剩余位置
5. 反向旋转回原始方向

**撤销系统**：
- 每次移动前深拷贝 grid + score + moves
- 历史栈最多存储 10-20 份快照
- 撤销时弹出最近快照恢复状态

---

## 🎯 功能特性

### 核心玩法
- **经典 2048 机制** — 上下左右四方向滑动，相同数字方块碰撞即合并
- **多种网格尺寸** — 4x4（经典）、5x5（宽敞）、6x6（挑战）三种模式可选
- **动态胜利条件** — 每种网格尺寸拥有独立目标：2048、4096 或 8192
- **胜利后继续挑战** — 达到目标后可继续游戏，冲击更高分

### 高级机制
- **撤销系统** — 最多支持 20 步撤销（可配置：5 / 10 / 20 步）
- **连击系统** — 单次移动触发多组合并可获得分数倍率（1.5x、2x、3x）
- **最高分持久化** — localStorage 按网格尺寸分别保存历史最高分
- **游戏统计** — 追踪游戏次数、累计步数、最高方块、各模式最高分

### 视觉与音效
- **三种主题** — 经典暖色、暗夜霓虹、纯净极简（即时切换）
- **流畅动画** — Framer Motion 驱动方块移动、合并、生成动画
- **粒子特效** — 合并时触发 DOM 粒子爆裂效果
- **合成音效** — Web Audio API 生成 6 种独立音效（移动 / 合并 / 生成 / 胜利 / 失败 / 点击）
- **音量控制** — 0-100% 可调节，偏好持久化

### 无障碍与用户体验
- **键盘控制** — 方向键、WASD、Z（撤销）、R（重置）、P（暂停）、Space（开始）
- **触屏支持** — 滑动手势操作，30px 最小阈值防止误触
- **暂停系统** — 随时暂停 / 继续，切换标签页自动暂停
- **倒计时开局** — 每局开始前 3-2-1-GO 倒计时序列
- **响应式设计** — 适配桌面与移动设备
- **屏幕阅读器支持** — aria-live 实时播报分数变化

### 技术亮点
- **三层架构** — Engine（纯 TS）/ State（Zustand）/ UI（React）严格分离
- **零后端** — 纯静态应用，localStorage 持久化
- **TypeScript 严格模式** — 完整类型安全 + Zod 运行时校验
- **单元测试** — 16+ 测试用例覆盖核心算法（Vitest）
- **性能优化** — 移动响应 <16ms，内存占用 <30MB

---

## 🎹 游戏说明

### 操作方式

| 操作 | 键盘 | 触屏 |
|------|------|------|
| 移动方块 | 方向键 或 WASD | 滑动（最小 30px） |
| 撤销 | Z | — |
| 重置 | R | — |
| 暂停 | P 或 Esc | — |
| 开始 / 确认 | Space 或 Enter | 点击按钮 |

### 游戏规则

1. **滑动** 方块向任意四个方向移动
2. **合并** 相同数字的方块在碰撞时合二为一
3. **计分** 得分等于合并后方块的数值（如 2+2=4 得 4 分）
4. **胜利** 合成目标方块即为胜利（4x4 为 2048，5x5 为 4096，6x6 为 8192）
5. **失败** 当网格被填满且无法进行任何合并时游戏结束
6. **连击** 加成：单次移动触发多组合并可获得分数倍率

### 计分规则

- 基础得分：合并后方块的数值之和
- 连击 2（2 组合并）：1.5 倍加成
- 连击 3（3 组合并）：2 倍加成
- 连击 4+（4 组及以上合并）：3 倍加成

---

## 📁 项目结构

```
2048/
├── docs/                         # 项目文档
│   ├── 01-项目立项.md
│   ├── 02-需求拆分.md
│   ├── 03-技术选型.md
│   ├── 04-项目架构.md
│   ├── 05-执行规划.md
│   └── 06-部署指南.md
│
├── src/
│   ├── config/                   # 全局配置 + Zod Schema
│   │   └── index.ts
│   │
│   ├── engine/                   # 游戏引擎（纯 TS）
│   │   ├── Board.ts              # 网格逻辑 + 合并 + 撤销
│   │   ├── GameEngine.ts         # 状态机 + 编排
│   │   ├── Input.ts              # 键盘 + 触屏输入
│   │   └── __tests__/            # 单元测试（16+ 用例）
│   │
│   ├── lib/                      # 工具库
│   │   ├── audio.ts              # AudioSystem（Web Audio API）
│   │   ├── storage.ts            # localStorage 安全封装
│   │   └── utils.ts              # cn() 工具函数
│   │
│   ├── store/                    # Zustand 状态层
│   │   └── useGameStore.ts       # 全局状态 + 持久化
│   │
│   ├── components/               # UI 组件
│   │   ├── 2048Game.tsx          # 引擎挂载点 + Context
│   │   ├── Board.tsx             # 网格容器 + 触屏绑定
│   │   ├── Tile.tsx              # 单方块 + 动画
│   │   ├── HUD.tsx               # 顶栏分数 + 控制按钮
│   │   ├── Overlays.tsx          # 阶段遮罩分发
│   │   ├── MainMenu.tsx          # 主菜单 + 统计
│   │   ├── SettingsPanel.tsx     # 网格 / 主题 / 音效设置
│   │   ├── Particles.tsx         # 合并粒子特效
│   │   └── ui/                   # shadcn/ui 基础组件
│   │
│   ├── App.tsx                   # 根组件
│   ├── main.tsx                  # 入口文件
│   └── index.css                 # 全局样式
│
├── public/                       # 静态资源
├── vercel.json                   # Vercel 部署配置
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## ⚡ 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| JS 包体积（gzip） | <=200KB | 128KB |
| CSS 包体积（gzip） | <=10KB | 4.4KB |
| 总加载量 | <=500KB | 145KB |
| 首屏渲染 | <=1s | <500ms |
| 移动响应 | <=50ms | <16ms |
| 内存占用 | <=50MB | <30MB |

---

## 🛠️ 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **框架** | React 18.3 | UI 渲染 |
| **语言** | TypeScript 5.4 | 类型安全 |
| **构建工具** | Vite 5.2 | 快速 HMR 与打包 |
| **状态管理** | Zustand 4.5 | 轻量级全局状态 |
| **样式** | Tailwind CSS 3.4 | 原子化 CSS |
| **UI 组件** | shadcn/ui + Radix | 无障碍基础组件 |
| **动画** | Framer Motion 11 | 布局动画 |
| **图标** | Lucide React | 统一图标库 |
| **音效** | Web Audio API | 合成音效 |
| **测试** | Vitest 1.6 | 单元测试 |
| **校验** | Zod 3.23 | 运行时类型检查 |
| **部署** | Vercel | 静态托管 |

---

## 📊 功能详解

### 网格尺寸

| 尺寸 | 目标 | 难度 | 策略 |
|------|------|------|------|
| 4x4 | 2048 | 经典 | 角落堆叠法 |
| 5x5 | 4096 | 宽敞 | 空间更大，目标更高 |
| 6x6 | 8192 | 挑战 | 需要复杂合并策略 |

### 主题

- **经典暖色** — 传统 2048 配色（#bbada0 棋盘背景，暖色调方块）
- **暗夜霓虹** — 赛博朋克风格（深紫背景，发光强调色）
- **纯净极简** — 简洁明亮（白色背景，柔和灰色）

### 音效

全部通过 Web Audio API 合成（无外部音频文件）：

| 事件 | 波形 | 时长 |
|------|------|------|
| 移动 | 正弦波 800→400Hz | 0.05s |
| 合并 | 三角波 200+方块值x8 Hz | 0.12s |
| 生成 | 正弦波 1200→600Hz | 0.03s |
| 胜利 | 正弦波 C5-E5-G5（三音） | 0.3s x 3 |
| 失败 | 锯齿波 440→110Hz | 0.4s |
| 点击 | 正弦波 600Hz | 0.04s |

---

## 🧪 测试

运行测试套件：

```bash
npm run test
```

测试覆盖范围：
- 方块移动算法（四个方向）
- 合并逻辑（单次 / 多组合并）
- 撤销系统（栈深度限制、状态恢复）
- 胜负判定条件
- 网格尺寸变体（4x4、5x5、6x6）
- 方块 ID 追踪（用于动画驱动）

---

## 🔒 隐私与安全

- **零数据收集** — 无分析追踪，无用户数据采集
- **仅本地存储** — 最高分与偏好设置保存在您的设备上
- **无第三方请求** — 完全自包含
- **无 Cookie** — 使用 localStorage 替代
- **XSS 防护** — Radix UI 基础组件防止注入攻击

---

## 🌐 浏览器兼容性

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 100+ | 支持 |
| Edge | 100+ | 支持 |
| Firefox | 100+ | 支持 |
| Safari | 15+ | 支持 |
| iOS Safari | 15+ | 支持 |
| Android Chrome | 100+ | 支持 |

---

## 📚 了解更多

- [Gabriele Cirulli 原版 2048](https://play2048.co/)
- [React 官方文档](https://reactjs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Zustand 指南](https://github.com/pmndrs/zustand)
- [Framer Motion](https://www.framer.com/motion/)

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- **Gabriele Cirulli** — 原版 2048 游戏概念
- **shadcn/ui** — 精美的组件基础库
- **Radix UI** — 无障碍无样式基础组件
- **Tailwind CSS** — 原子化 CSS 框架

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐ Star！**

[GitHub](https://github.com/NOSOLUTIONLOVE/Web_Game_02_2048) · [在线体验](https://game-2048.vercel.app) · [问题反馈](https://github.com/NOSOLUTIONLOVE/Web_Game_02_2048/issues)

</div>
