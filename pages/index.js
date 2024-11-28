import { useThree } from "../hooks/useThree.js";
import ThreeApp from "../threejs/ThreeApp.js";
import { useState } from "react";
import Setting from "./Setting.js";
import Head from "next/head";
import Banner from "./Banner.js";
import BOM from "./BOM";

export default function Home() {
  const { canvas, threeInstance } = useThree(ThreeApp);
  const [settings, setSettings] = useState({
    detailedView: true,
    enableSpheres: false,
    enablePartsHighlight: true,
  });
  const settingNames = ["detailedView", "enablePartsHighlight"];
  const settingIdentifiers = ["Detailed View", "Enable Parts Highlight"];
  const [meshList, setMeshList] = useState([]);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [bomOpen, setBomOpen] = useState(false);
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
  const [bloom, setBloom] = useState(true);

  function fishMeshList() {
    if (!threeInstance.current) {
      return;
    }
    const ml = threeInstance.current.getMeshList();
    // console.log("fishMeshList ", meshList, ml);
    if (ml && ml.length > meshList) {
      // console.log("fish found ", ml);
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

  function updateSettings(newSettings) {
    setSphereSelected(null);
    setGroupHovered(null);
    setSettings(structuredClone(newSettings));
  }

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="main bg-blue-500 overflow-hidden">
        <div
          id="title"
          className="--font-geist-sans text-3xl font-extrabold text-t1 bg-t4 shadow-[0px_0px_3px_2px_#16697Aff,0px_2px_24px_1px_#16697Aff_inset] rounded-lg w-[500px] left-[calc(50vw-250px)] px-9 py-3 mx-auto absolute top-3 h-fit z-40 text-center"
          style={{ textShadow: "1px 1px 30px rgba(252, 252, 252, 1)" }}
        >
          INTERACTIVE DEMO
        </div>
        <div id="popup"></div>
        <div
          id="dropdown"
          className=" absolute top-3 py-4 px-7 group left-3 z-50 text-t1 bg-[#82c0cc] bg-opacity-80 shadow-[0px_0px_7px_4px_#16697Aff_inset,5px_5px_0px_0px_rgba(80,85,115,0.2)] rounded-xl"
        >
          <div
            className="text-xl font-extrabold  text-center px-2"
            style={{ textShadow: "1px 1px 21px #16697Aff" }}
          >
            Settings
          </div>
          <div className="rajdhani-bold grid-cols-[auto_auto] hidden group-hover:grid gap-x-2 gap-y-2 mt-4">
            {settingNames.map((name, i) => {
              return (
                <Setting
                  key={i}
                  name={name}
                  identifier={settingIdentifiers[i]}
                  settings={settings}
                  setSettings={updateSettings}
                  threeInstance={threeInstance}
                />
              );
            })}
          </div>
        </div>
        <div
          className="absolute text-base rajdhani-bold group px-5 py-2 bg-[#16698A] bg-opacity-80 hover:bg-opacity-90 active:bg-opacity-70 font-bold bottom-3 left-3 rounded-lg cursor-pointer z-50"
          onClick={() => setDemoPlaying(!demoPlaying)}
        >
          Video Demo
        </div>
        <div
          className="absolute left-36 text-base rajdhani-bold group px-5 py-2  bg-[#16698A] bg-opacity-80 hover:bg-opacity-90 active:bg-opacity-70 font-bold bottom-3  rounded-lg cursor-pointer z-50"
          onClick={() => setBomOpen(!bomOpen)}
        >
          Bill of Materials
        </div>
        <div className={(bomOpen ? "block" : "hidden") + " absolute"}>
          <BOM csvName="./bom.csv" on_exit={setBomOpen} />
        </div>

        <div
          className="absolute bottom-3 left-80 text-base rajdhani-bold group px-5 py-2 bg-[#16698A] bg-opacity-80 hover:bg-opacity-90 active:bg-opacity-70 font-bold rounded-lg cursor-pointer z-50"
          onClick={() => {
            if (threeInstance.current) {
              threeInstance.current.toggleBloom(!bloom);
            }
            setBloom(!bloom);
          }}
        >
          Toggle Bloom Effect {bloom ? "Off" : "On"}
        </div>
        <div
          id="keyregionscontainer"
          className="absolute right-3 group grid grid-cols-1 gap-1 top-3 py-4 px-9 z-40 text-t1 bg-[#82c0cc] bg-opacity-80 shadow-[0px_0px_7px_4px_#16697Aff_inset,5px_5px_0px_0px_rgba(80,85,115,0.2)] rounded-xl h-fit hover:h-44"
        >
          <div
            className="text-xl font-extrabold mx-auto "
            style={{ textShadow: "1px 1px 21px #16697Aff" }}
          >
            Parts List
          </div>
          <div className="overflow-y-visible group-hover:grid hidden overflow-x-hidden gap-1 mt-2">
            {meshList.map((mesh) => {
              return (
                <div
                  key={mesh.name}
                  className="rajdhani-bold px-4 py-[2px] w-fit rounded-sm ml-auto mr-0 bg-gray-300 hover:bg-gray-400 cursor-pointer"
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
        </div>
        {demoPlaying && (
          <div className="absolute w-[100vw] h-[100vh] z-50">
            <div
              className="w-full h-full bg-slate-400 bg-opacity-50 absolute"
              onClick={() => {
                setDemoPlaying(false);
              }}
            ></div>
            <Banner title="Demo" />
            <video
              className="relative m-auto w-[720px] h-[480px] z-[60] top-28"
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
              <Banner
                title={sphereSelected.name
                  .split("_")
                  .join(" ")
                  .replaceAll("+", "&")}
              />
              <video
                className="relative m-auto w-[720px] h-[480px] z-[60] top-28"
                controls
                width="720"
                height="480"
              >
                <source
                  src={`./Demos/${sphereSelected.name
                    .split("_")
                    .join("")
                    .split("+")
                    .join("")
                    .toLowerCase()}.mp4`}
                  type="video/mp4"
                />
              </video>
            </div>
          )}
        {groupHovered && settings.detailedView && (
          <div className="absolute bottom-2 right-2 z-50">
            <div className="relative text-lg z-50 text-t1 font-extrabold">
              {groupHovered.name.split("_").join(" ").replaceAll("+", " & ")}
            </div>
            {partDetails[groupHovered.name] && (
              <div className="relative text-base font-base z-50 text-t2">
                {partDetails[groupHovered.name].desc}
              </div>
            )}
          </div>
        )}
        <div className="absolute bottom-3 mx-auto text-t3 text-lg opacity-70 z-[100] block w-[220px] text-center h-fit left-[calc(50vw-110px)] bg-t4 font-extrabold py-0 rounded-sm">
          afl-site.vercel.app
        </div>

        <div id="cameralockscreen"></div>
        <div
          ref={canvas}
          className="absolute w-[100vw] h-[100vh] z-10"
          onMouseMove={(event) => onMouseMove(event)}
          onMouseDown={(e) => {
            if (e.button != 0) return;
            if (threeInstance.current) {
              setSphereSelected(
                threeInstance.current.getMeshGroupOfHighlightedMesh()
              );
            }
          }}
        ></div>
      </div>
    </>
  );
}
