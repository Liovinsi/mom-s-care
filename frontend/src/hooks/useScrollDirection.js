import { useEffect, useRef, useState } from "react";

const TOP_OFFSET = 12;
const HIDE_THRESHOLD = 10;
const SHOW_THRESHOLD = 4;

const useScrollDirection = () => {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(window.scrollY);
  const ticking = useRef(false);

  useEffect(() => {
    const evaluate = () => {
      const currentY = Math.max(window.scrollY, 0);
      const diff = currentY - lastY.current;

      if (currentY <= TOP_OFFSET) {
        setVisible(true);
        lastY.current = currentY;
      } else if (diff > HIDE_THRESHOLD) {
        setVisible(false);
        lastY.current = currentY;
      } else if (diff < -SHOW_THRESHOLD) {
        setVisible(true);
        lastY.current = currentY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(evaluate);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
};

export default useScrollDirection;
