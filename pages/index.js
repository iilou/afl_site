import ThreeApp from "../threejs/ThreeApp";
import { useLayoutEffect } from "react";
import { useThree } from "../hooks/useThree";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  //The argument for useThree is your threejs main class
  const { canvas, threeInstance } = useThree(ThreeApp);
  const [cameraData, setCameraData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    console.log(x, y);
    const rect = canvas.current.getBoundingClientRect();

    if (threeInstance.current) {
      const normx = (x / rect.width) * 2 - 1;
      const normy = -(y / rect.height) * 2 + 1;

      setMousePosition({ x: normx, y: normy });
      if (threeInstance.current) {
        threeInstance.current.onMouseMove(normx, normy);
      }
    }
  }

  useEffect(() => {
    const updateCameraPosition = () => {
      if (threeInstance.current) {
        const position = threeInstance.current.getCameraPosition();
        const direction = threeInstance.current.getCameraDirection();
        setCameraData({
          position: {
            x: position.x,
            y: position.y,
            z: position.z,
          },
          direction: {
            x: direction.x,
            y: direction.y,
            z: direction.z,
          },
        });
      }
    };

    // Update the camera position on render
    const interval = setInterval(updateCameraPosition, 100); // Update every 100ms
    return () => clearInterval(interval); // Clean up on unmount
  }, [threeInstance]);

  return (
    <>
      <div
        style={{
          width: "100vw",
          fontSize: 24,
          fontWeight: 900,
          textAlign: "center",
          position: "absolute",
        }}
      >
        TEST
      </div>
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 100,
          width: "240px",
          height: "400px",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      ></div>
      <div
        ref={canvas}
        style={{ height: "100vh" }}
        onMouseMove={(e) => handleMouseMove(e)}
      >
        {cameraData && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              color: "white",
            }}
          >
            Camera Position: X: {cameraData.position.x.toFixed(2)} Y:
            {cameraData.position.y.toFixed(2)} Z:
            {cameraData.position.z.toFixed(2)}
            <br />
            Camera Direction: X: {cameraData.direction.x.toFixed(2)} Y:
            {cameraData.direction.y.toFixed(2)} Z:
            {cameraData.direction.z.toFixed(2)}
          </div>
        )}
      </div>
    </>
  );
}
