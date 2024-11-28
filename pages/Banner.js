export default function Banner({ title }) {
  return (
    <div className="absolute w-[100vw] z-50 text-4xl py-5 text-center font-extrabold bg-t5 rounded-b-lg text-t1">
      {title}
    </div>
  );
}
