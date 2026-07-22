import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per token
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 25, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const tokens = text.match(/\s+|\S+/g) || [];
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < tokens.length) {
        setDisplayedText((prev) => prev + tokens[index]);
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="whitespace-pre-line leading-relaxed">{displayedText}</span>;
}
