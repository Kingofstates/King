import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={togglePlay}
        title={playing ? "Pause Music" : "Play Music"}
        className={`w-12 h-12 rounded-full flex items-center justify-center 
          bg-gray-900 border border-cyan-400 
          transition transform hover:scale-110
          ${
            playing
              ? "shadow-[0_0_20px_5px_rgba(0,200,255,0.9)] animate-[pulse_1s_ease-in-out_infinite]"
              : "shadow-[0_0_12px_3px_rgba(0,200,255,0.4)]"
          }`}
      >
        {playing ? (
          <Volume2 size={22} className="text-cyan-300" />
        ) : (
          <VolumeX size={22} className="text-gray-500" />
        )}
      </button>

      {/* hidden audio element */}
      <audio ref={audioRef} src="/background.mp3" loop autoPlay />
    </div>
  );
}
