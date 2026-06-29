import { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  wobble: number;
}

export default function Fireflies() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const firefliesRef = useRef<Firefly[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    const moonColors = [
      '#F5D06B',
      '#EFE5D2',
      '#C8B6FF',
      '#AFC8FF',
      '#B8FFD7',
    ];

    const rainColors = [
      '#8BC5FF',
      '#AFC8FF',
      '#D6E6FF',
      '#BEEBFF',
      '#C8D8FF',
    ];

    const moveMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      const colors = theme === 'moon' ? moonColors : rainColors;

      firefliesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
      });

      if (firefliesRef.current.length > 10) {
        firefliesRef.current.shift();
      }
    };

    window.addEventListener('mousemove', moveMouse);

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      firefliesRef.current = firefliesRef.current.filter((f) => f.life > 0);

      firefliesRef.current.forEach((f, i) => {
        f.life -= 0.01;

        f.x += f.vx + Math.sin(performance.now() * 0.002 + f.wobble) * 0.3;
        f.y += f.vy + Math.cos(performance.now() * 0.002 + f.wobble) * 0.3;

        const alpha = f.life;

        ctx.save();

        ctx.globalAlpha = alpha;

        ctx.fillStyle = f.color;
        ctx.shadowBlur = 18;
        ctx.shadowColor = f.color;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', moveMouse);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 3,
      }}
    />
  );
}