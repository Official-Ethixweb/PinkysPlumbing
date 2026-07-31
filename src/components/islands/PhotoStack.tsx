import { useEffect, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import './PhotoStack.css';

interface CardData {
  id: number;
  content: ReactNode;
}

function CardRotate({
  children,
  onSendToBack,
  sensitivity
}: {
  children: ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface PhotoStackProps {
  images: { src: string; alt: string }[];
  randomRotation?: boolean;
  sensitivity?: number;
}

/**
 * Draggable photo stack, adapted from React Bits' Stack component onto
 * `motion/react` (already a project dependency, so this adds zero new
 * packages). Drag a card away to send it to the back of the pile.
 */
export default function PhotoStack({ images, randomRotation = true, sensitivity = 180 }: PhotoStackProps) {
  const [stack, setStack] = useState<CardData[]>(() =>
    images.map((img, index) => ({
      id: index,
      content: <img src={img.src} alt={img.alt} className="card-image" draggable={false} />
    }))
  );

  // Per-card tilt jitter. Generated client-side only, after mount: computing
  // it during render would run once during SSR and again (with a different
  // Math.random() result) on the client's first render, and React flags
  // that mismatch as a hydration error. Every card starts at 0deg jitter
  // (server and client agree), then this effect nudges them, which is a
  // normal post-hydration update rather than a mismatch.
  const [jitter, setJitter] = useState<Record<number, number>>({});
  useEffect(() => {
    if (!randomRotation) return;
    setJitter(Object.fromEntries(images.map((_, index) => [index, Math.random() * 12 - 6])));
  }, [images, randomRotation]);

  useEffect(() => {
    setStack(
      images.map((img, index) => ({
        id: index,
        content: <img src={img.src} alt={img.alt} className="card-image" draggable={false} />
      }))
    );
  }, [images]);

  const sendToBack = (id: number) => {
    setStack((prev) => {
      const next = [...prev];
      const index = next.findIndex((card) => card.id === id);
      const [card] = next.splice(index, 1);
      next.unshift(card);
      return next;
    });
  };

  return (
    <div className="stack-container">
      {stack.map((card, index) => (
        <CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)} sensitivity={sensitivity}>
          <motion.div
            className="card"
            animate={{
              rotateZ: (stack.length - index - 1) * 5 + (jitter[card.id] ?? 0),
              scale: 1 - (stack.length - 1 - index) * 0.06,
              transformOrigin: '90% 90%'
            }}
            initial={false}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {card.content}
          </motion.div>
        </CardRotate>
      ))}
    </div>
  );
}
