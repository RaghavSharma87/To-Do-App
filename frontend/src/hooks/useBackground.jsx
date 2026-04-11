import { useEffect, useState } from "react";

export function useBackground() {
  const [bg, setBg]           = useState(() => localStorage.getItem("bgImage") || "");
  const [overlay, setOverlay] = useState(() => Number(localStorage.getItem("bgOverlay") || 35));
  const [blur, setBlur]       = useState(() => Number(localStorage.getItem("bgBlur") || 0));

  useEffect(() => {
    const sync = () => {
      setBg(localStorage.getItem("bgImage") || "");
      setOverlay(Number(localStorage.getItem("bgOverlay") || 35));
      setBlur(Number(localStorage.getItem("bgBlur") || 0));
    };
    window.addEventListener("bg-updated", sync);
    return () => window.removeEventListener("bg-updated", sync);
  }, []);

  return { bg, overlay, blur };
}