import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import VideoCard from "./VideoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPath } from "../lib/utils";
import exhibitsData from "../data.json";

const exhibits = exhibitsData;

const CARD_WIDTH = 280;
const CARD_GAP = 40;
const VISIBLE_CARDS = 5;

const CylinderCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(exhibits.length / 2));
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateTransform = (index: number) => {
    const offset = index - activeIndex;

    // Cylinder radius effect
    const angle = offset * 25; // degrees rotation per card
    const rotateY = angle;

    // Z-depth based on position (cards curve back)
    const z = -Math.abs(offset) * 60;

    // X position along the arc
    const xOffset = offset * (CARD_WIDTH + CARD_GAP);

    // Scale decreases as cards move away from center
    const scale = Math.max(0.65, 1 - Math.abs(offset) * 0.12);

    // Opacity fades at edges
    const opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.25);

    return {
      x: xOffset,
      rotateY,
      z,
      scale,
      opacity,
    };
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = CARD_WIDTH / 3;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    let newIndex = activeIndex;

    if (offset < -threshold || velocity < -500) {
      newIndex = Math.min(activeIndex + 1, exhibits.length - 1);
    } else if (offset > threshold || velocity > 500) {
      newIndex = Math.max(activeIndex - 1, 0);
    }

    setActiveIndex(newIndex);
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  };

  const navigateTo = (direction: "prev" | "next") => {
    if (direction === "prev" && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (direction === "next" && activeIndex < exhibits.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  // Map drag position to temporary visual offset
  const dragOffset = useTransform(x, [-300, 0, 300], [1, 0, -1]);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Spotlight effect */}
      <div className="spotlight" />

      {/* Header */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center z-10 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >

        <h2 className="text-3xl md:text-5xl font-light text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
          Department of Computer Science, Mattu Pongal
        </h2>
      </motion.div>

      {/* Carousel container */}
      <div
        ref={containerRef}
        className="relative w-full h-[500px] perspective-1000 flex items-center justify-center"
      >
        {/* Cards */}
        <motion.div
          className="relative preserve-3d flex items-center justify-center cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
        >
          {exhibits.map((exhibit, index) => {
            const transform = calculateTransform(index);
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={exhibit.id}
                className="absolute backface-hidden"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_WIDTH * (16 / 9),
                }}
                animate={{
                  x: transform.x,
                  rotateY: transform.rotateY,
                  z: transform.z,
                  scale: transform.scale,
                  opacity: transform.opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={isActive ? { scale: transform.scale * 1.02 } : {}}
                onClick={() => setActiveIndex(index)}
              >
                <VideoCard
                  index={index}
                  title={exhibit.title}
                  videoSrc={getPath(exhibit.videoFileName)}
                  isActive={isActive}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-6 z-10">
        <motion.button
          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => navigateTo("prev")}
          disabled={activeIndex === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Pagination dots */}
        <div className="flex items-center gap-2">
          {exhibits.map((_, index) => (
            <motion.button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex
                ? "w-8 bg-accent"
                : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        <motion.button
          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => navigateTo("next")}
          disabled={activeIndex === exhibits.length - 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Active exhibit info */}
      <motion.div
        className="absolute bottom-32 left-0 right-0 text-center"
        key={activeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >

      </motion.div>

      {/* Ambient gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full bg-accent/5 blur-[100px] animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* Instructions */}
      <motion.p
        className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground/50 text-xs tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Drag to explore • Click to select
      </motion.p>
    </div>
  );
};

export default CylinderCarousel;