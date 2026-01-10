import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";

interface VideoCardProps {
  index: number;
  title: string;
  artist?: string;
  thumbnailGradient?: string;
  videoSrc?: string;
  isActive: boolean;
}

const VideoCard = ({ index, title, artist, thumbnailGradient, videoSrc, isActive }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset playback when card becomes inactive
  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    // Only allow interaction if the card is active
    if (!isActive) return;

    e.stopPropagation(); // Prevent parent click (which selects the card)

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={`glass-card aspect-[9/16] w-full h-full ${isActive ? 'active-card' : ''}`}
      onClick={togglePlay}
    >
      {/* Video Container */}
      <div className="video-container relative w-full h-full overflow-hidden rounded-xl">
        {/* Helper for gradient background if video is loading or not present */}
        <div
          className="absolute inset-0"
          style={{ background: thumbnailGradient || 'linear-gradient(135deg, #4E342E 0%, #261815 100%)' }}
        />

        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            playsInline
          // autoPlay removed as per requirement
          />
        )}

        {/* Animated overlay lines for visual interest */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-gradient-to-r from-transparent via-accent to-transparent"
              style={{ top: `${20 + i * 15}%` }}
              animate={{
                x: ["-100%", "100%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Center play indicator - Only show when NOT playing */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive && !isPlaying ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Show Play icon if paused, pause icon if playing? 
                Requirement says: "When paused, show a subtle 'Play' icon... the user knows it's interactive."
                So we hide it when playing.
            */}
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-semibold text-lg leading-tight mb-1">
              {title}
            </h3>
            {artist && (
              <p className="text-white/50 text-sm">
                {artist}
              </p>
            )}
          </motion.div>
        </div>

        {/* Top corner audio indicator */}
        <div className="absolute top-3 right-3">
          <motion.div
            className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            animate={{ opacity: isActive ? 1 : 0.5 }}
          >
            <Volume2 className="w-4 h-4 text-white/70" />
          </motion.div>
        </div>

        {/* Active glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 40px hsl(var(--glass-glow))",
          }}
          animate={{
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Reflection glow at bottom */}
      <div className="card-reflection" />
    </div>
  );
};

export default VideoCard;