import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      // try to auto-play on load
      audioRef.current.play().catch(() => {
        // if browser blocks autoplay, mark as not playing
        setPlaying(false);
      });
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
    <div className="ml-4">
      <button
        onClick={togglePlay}
        className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full shadow"
        title={playing ? 'Pause Music' : 'Play Music'}
      >
        {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      {/* hidden audio element */}
      <audio ref={audioRef} src="/background.mp3" loop autoPlay />
    </div>
  );
}
