import { useState } from "react";

export default function BOM_item({
  key = 0,
  name = "name",
  material = "material",
  description = "-",
  quantity = [1, 2, 3],
  amount_spent = 0,
  production_cost = 0,
  source = "source",
  sizes = [200, 200, 200, 200, 200, 300],
}) {
  const [detailedView, setDetailedView] = useState(true);
  // console.log("BOM_item props:", {
  //   name,
  //   material,
  //   amount_spent,
  //   production_cost,
  //   source,
  //   description,
  //   quantity,
  // });

  return (
    <>
      <div
        className={`grid bg-emerald-500 gap-1 group text-t4`}
        style={{
          gridTemplateColumns: `${sizes[0]}px ${sizes[1]}px ${sizes[2]}px ${sizes[3]}px ${sizes[4]}px ${sizes[5]}px`,
        }}
      >
        {[name, material, amount_spent, production_cost, source].map(
          (item, i) => {
            return (
              <div
                key={i}
                className="px-3 py-1 bg-emerald-700  font-bold text-sm group-hover:bg-emerald-800 transition-all shadow-[1px_1px_8px_rgba(6,85,60,1)_inset]"
              >
                {item == "" ? "-" : item}
              </div>
            );
          }
        )}
        <div
          className="px-3 py-1 bg-emerald-700  font-bold text-sm group-hover:bg-emerald-800 transition-all cursor-pointer shadow-[1px_1px_8px_rgba(6,85,60,1)_inset]"
          onClick={() => setDetailedView(!detailedView)}
        >
          {detailedView ? "Hide" : "Show"} Details
        </div>
      </div>
      {detailedView && (
        <div className="bg-t2 shadow-[0px_0px_20px_rgba(31,99,123,1)_inset] py-3 flex flex-col gap-1">
          <div className="text-xs font-bold flex">
            <div className="ml-4 w-24 text-xs font-extrabold">Description</div>
            <div className="ml-2 text-xs font-bold">
              {description == "" ? "-" : description}
            </div>
          </div>
          <div className="flex text-xs font-bold">
            <div className="ml-4 w-24 font-extrabold">Quantity</div>
            {/* {console.log("quantity", quantity)} */}
            <div className="ml-2">
              {quantity.map((q, i) => {
                return <div key={i}>{q}</div>;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
