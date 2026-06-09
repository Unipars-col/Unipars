"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type PromoCardHoverProps = {
  src: string;
  alt: string;
  videoSrc?: string;
};

export default function PromoCardHover({ src, alt, videoSrc }: PromoCardHoverProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  const handleEnter = () => {
    if (!videoSrc) return;
    setActive(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleLeave = () => {
    if (!videoSrc) return;
    setActive(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="relative aspect-[941/1672] overflow-hidden rounded-2xl cursor-pointer"
      style={{ width: "55vw" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width:768px) 55vw, 25vw"
        className="object-cover object-center"
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: active ? 1 : 0 }}
        />
      )}
    </div>
  );
}
