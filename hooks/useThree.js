import { useEffect, useRef } from "react";

export const useThree = (ThreeClass) => {
  const canvas = useRef(null);
  const threeInstance = useRef(null);

  useEffect(() => {
    if (!threeInstance.current) {
      threeInstance.current = new ThreeClass(canvas.current);
    }
  }, [ThreeClass]);

  return { canvas, threeInstance };
};
