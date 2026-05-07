"use client";
import React, { useState, useEffect } from "react";

const TypewriterEffect = ({
  text,
  speed,
  title,
}: {
  text: string;
  speed: number;
  title?: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return title ? (
    <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-4">
      {displayedText}
    </h1>
  ) : (
    <p className="text-lg md:text-xl text-gray-200 mt-2">
      {displayedText}
    </p>
  );
};

export default TypewriterEffect;