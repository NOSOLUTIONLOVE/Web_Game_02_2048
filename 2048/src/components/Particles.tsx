/**
 * Particles - 合并粒子爆裂特效（DOM 实现）
 *
 * 职责：
 * - 在指定像素坐标生成 8 颗粒子向外爆裂
 * - 带重力下坠与淡出效果
 * - 一次性动画，由父组件控制 bursts 数组的增删
 *
 * 设计：
 * - 每颗粒子随机角度（0-360deg）+ 随机距离（20-50px）
 * - framer-motion 驱动 x/y/opacity/scale 变化
 * - 容器 absolute + pointer-events-none，不影响交互
 */

import { motion } from 'framer-motion';

export interface ParticleBurst {
  /** 唯一标识 */
  id: number;
  /** 像素坐标 x */
  x: number;
  /** 像素坐标 y */
  y: number;
  /** 粒子颜色 */
  color: string;
}

interface ParticlesProps {
  bursts: ParticleBurst[];
}

/** 单次爆裂生成的粒子数 */
const PARTICLE_COUNT = 8;

/** 生成单次爆裂的 8 颗粒子配置 */
function buildParticles(burst: ParticleBurst) {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    // 随机角度（弧度）与距离
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5;
    const distance = 20 + Math.random() * 30; // 20-50px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    return { dx, dy, key: `${burst.id}-${i}` };
  });
}

export function Particles({ bursts }: ParticlesProps) {
  if (bursts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {bursts.map((burst) =>
        buildParticles(burst).map((p) => (
          <motion.span
            key={p.key}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: burst.x,
              top: burst.y,
              backgroundColor: burst.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: p.dx,
              // 重力：y 方向额外下坠 30px
              y: p.dy + 30,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))
      )}
    </div>
  );
}
