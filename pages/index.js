import { useThree } from "../hooks/useThree.js";
import ThreeApp from "../threejs/ThreeApp.js";
import { useState } from "react";
import Setting from "./Setting.js";

export default function Home() {
  const { canvas, threeInstance } = useThree(ThreeApp);
  const [settings, setSettings] = useState({
    detailedView: false,
    enableSpheres: false,
    enablePartsHighlight: false,
  });
  const settingNames = ["detailedView", "enablePartsHighlight"];
  const settingIdentifiers = ["Detailed View", "Enable Parts Highlight"];
  const [meshList, setMeshList] = useState([]);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const partDetails = {
    Horizontal_Adjustment: {
      name: "Horizontal Rail",
      desc: "Horizonal rail for easy and smooth horizontal adjustability",
    },
    Vertical_Adjustment: {
      name: "Vertical Rail",
      desc: "Vertical rail for easy and smooth vertical adjustability",
    },
    "Pivot_+_Foot_Platform": {
      name: "Pivot + Foot Platform",
      desc: "Pivot for easy and smooth rotational adjustability",
    },
    Compression_Latch: {
      name: "Compression Latch",
      desc: "Compression latch for quick one turn lock and unlock to secure the frame",
    },
    Top_Hinge: {
      name: "Top Hinge",
      desc: "Top hinge for quick and easy attachment onto the leg press board",
    },
  };
  const [sphereSelected, setSphereSelected] = useState(null);
  const [groupHovered, setGroupHovered] = useState(null);

  function fishMeshList() {
    if (!threeInstance.current) {
      return;
    }
    const ml = threeInstance.current.getMeshList();
    console.log("fishMeshList ", meshList, ml);
    if (ml && ml.length > meshList) {
      console.log("fish found ", ml);
      setMeshList(ml);
    }
  }

  function onMouseMove(event) {
    // console.log("mouse move", event.clientX, event.clientY);
    if (threeInstance.current) {
      threeInstance.current.findPartClicked(
        event,
        canvas.current.getBoundingClientRect()
      );
      fishMeshList();
      setGroupHovered(threeInstance.current.getMeshGroupOfHighlightedMesh());
    }
  }

  return (
    <div className="main bg-blue-500 overflow-hidden">
      <div
        id="title"
        className="--font-geist-sans text-3xl font-extrabold text-indigo-500 bg-white rounded-lg w-[400px] left-[calc(50vw-200px)] px-7 py-2 mx-auto absolute top-3 h-fit z-40 text-center"
      >
        PRODUCT DEMO
      </div>
      <div id="popup"></div>
      <div
        id="dropdown"
        className="--font-geist-mono absolute top-3 p-3   bg-slate-600 bg-opacity-50 rounded-xl group left-3 z-50"
      >
        <div className="text-xl font-extrabold text-center px-2">Settings</div>
        <div className="grid-cols-[auto_auto] hidden group-hover:grid gap-x-2 gap-y-2 mt-4">
          {settingNames.map((name, i) => {
            return (
              <Setting
                key={i}
                name={name}
                identifier={settingIdentifiers[i]}
                settings={settings}
                setSettings={setSettings}
                threeInstance={threeInstance}
              />
            );
          })}
        </div>
      </div>
      <div
        className="absolute text-lg group px-5 py-2 bg-slate-600 bg-opacity-50 font-bold bottom-3 left-3 rounded-lg cursor-pointer z-50"
        onClick={() => setDemoPlaying(!demoPlaying)}
      >
        Video Demo
      </div>
      <div
        id="keyregionscontainer"
        className="absolute right-3 group grid grid-cols-1 gap-1 top-3 py-3 px-5 z-50 rounded-lg bg-slate-600 bg-opacity-50 overflow-y-visible overflow-x-hidden hover:h-52 h-fit"
      >
        <div className="text-xl font-extrabold  mx-auto">Parts List</div>
        {meshList.map((mesh) => {
          return (
            <div
              key={mesh.name}
              className="bg-slate-400 hover:bg-slate-800 cursor-pointer active:bg-slate-600 px-4 py-[2px] hidden group-hover:block w-fit rounded-sm ml-auto mr-0"
              onClick={() => {
                if (threeInstance.current)
                  threeInstance.current.panToPart(mesh.name);
              }}
            >
              {mesh.name}
            </div>
          );
        })}
      </div>
      {demoPlaying && (
        <div className="absolute w-[100vw] h-[100vh] z-50">
          <div
            className="w-full h-full bg-slate-400 bg-opacity-50 absolute"
            onClick={() => {
              setDemoPlaying(false);
            }}
          ></div>
          <div className="relative mx-auto font-extrabold text-3xl text-white bg-indigo-500 rounded-lg z-60 py-5 text-center rounded-b-xl">
            Demo
          </div>
          <video
            className="relative m-auto w-[720px] h-[480px] z-[60]"
            controls
            width="720"
            height="480"
          >
            <source src="./Leg Press Demo.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      {settings.enablePartsHighlight &&
        sphereSelected &&
        sphereSelected.name.split("_")[0] != "Frame" && (
          <div className="absolute w-[100vw] h-[100vh] z-50">
            <div
              className="w-full h-full bg-slate-400 bg-opacity-50 absolute"
              onMouseDown={() => {
                setSphereSelected(false);
              }}
            ></div>
            <div className="relative mx-auto font-extrabold text-3xl text-white bg-indigo-500 rounded-lg z-60 py-5 text-center rounded-b-xl">
              {sphereSelected.name.split("_").join(" ")}
            </div>
            <video
              className="relative m-auto w-[720px] h-[480px] z-[60]"
              controls
              width="720"
              height="480"
            >
              <source src="./Leg Press Demo.mp4" type="video/mp4" />
            </video>
          </div>
        )}
      {groupHovered && settings.detailedView && (
        <div className="absolute bottom-2 right-2 z-50">
          <div className="relative text-lg font-bold z-50">
            {groupHovered.name.split("_").join(" ")}
          </div>
          {partDetails[groupHovered.name] && (
            <div className="relative text-base font-base z-50">
              {partDetails[groupHovered.name].desc}
            </div>
          )}
        </div>
      )}
      <div id="cameralockscreen"></div>
      <div
        ref={canvas}
        className="absolute w-[100vw] h-[100vh] z-10"
        onMouseMove={(event) => onMouseMove(event)}
        onMouseDown={() => {
          if (threeInstance.current) {
            setSphereSelected(
              threeInstance.current.getMeshGroupOfHighlightedMesh()
            );
          }
        }}
      ></div>
    </div>
  );
}
