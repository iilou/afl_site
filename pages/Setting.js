export default function Setting({
  settings = {},
  setSettings = () => {},
  name = "",
  identifier = "",
  threeInstance = { current: null },
}) {
  function test() {
    const s = structuredClone(settings);
    s[name] = !s[name];
    setSettings(s);
    if (!threeInstance) return;
    if (threeInstance.current) {
      threeInstance.current.updateSettings(s);
    }
  }

  return (
    <>
      <div
        className={
          "w-8 h-0 group-hover:h-8 rounded-xl  hidden group-hover:block transition-all " +
          (settings[name] ? "bg-gray-100" : "bg-gray-300 hover:bg-gray-400")
        }
        onMouseDown={test}
      >
        <div
          className={
            "w-6 h-6  mx-auto mt-1 rounded-full relative block z-[60] bg-slate-700  " +
            (settings[name] ? "block" : "hidden")
          }
        ></div>
      </div>
      <div
        className={
          "h-8 hidden  group-hover:block rounded-xl px-7 py-1 text-indigo-700 font-extrabold text-base transition-all " +
          (settings[name] ? "bg-gray-100" : "bg-gray-300 hover:bg-gray-400")
        }
        onMouseDown={test}
      >
        {identifier}
      </div>
    </>
  );
}
