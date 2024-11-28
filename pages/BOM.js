import { useState, useEffect } from "react";
import BOM_item from "./BOM_item";
import Banner from "./Banner";

export default function BOM({ csvName, on_exit = () => {} }) {
  // const [csvData, setCsvData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const sizes = [200, 200, 200, 200, 200, 300];

  function setCsvData(fetched_data) {
    const split = fetched_data.split("\r").join("").split("\n");
    const headers = split[0].split(",");
    const data = split.slice(1);
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].split(",");
    }

    const itemList = [];
    for (let i = 0; i < data.length; i++) {
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j].toLowerCase()] = data[i][j];
      }
      itemList.push(item);
    }
    // console.log("item: ", itemList);
    setItems(itemList);
  }

  useEffect(() => {
    // console.log("funciton", on_exit);
    console.log("name ", csvName);
    fetch(csvName)
      .then((response) => response.text())
      .then((data) => {
        console.log("data ", data);
        setCsvData(data);
      });
  }, [csvName]);

  return (
    <div className="absolute w-[100vw] h-[100vh] block">
      <div
        className="absolute w-[100vw] h-[100vh] bg-gray-300 bg-opacity-40 z-50"
        onClick={() => on_exit(false)}
      ></div>
      <Banner title="Bill of Materials" />
      <div className="relative mx-auto mt-40 bg-t1 rounded-lg z-50 w-fit h-fit py-2">
        <div
          className={"grid gap-1 w-fit bg-t1 group"}
          style={{
            gridTemplateColumns: `${sizes[0]}px ${sizes[1]}px ${sizes[2]}px ${sizes[3]}px ${sizes[4]}px ${sizes[5]}px`,
          }}
        >
          {[
            "Name",
            "Material",
            "Amount Spent",
            "Production Cost",
            "Source",
            "Details (Info & Quantity)",
          ].map((header, i) => {
            return (
              <div
                key={i}
                className="px-3 py-2 bg-t4 text-t1 font-extrabold text-base hv-t4 hv-bg-t1 transition-all shadow-[0px_0px_20px_#489Fb5ff_inset]"
                style={{ textShadow: "1px 1px 12px #489Fb5ff" }}
              >
                {header}
              </div>
            );
          })}
        </div>
        <div className="h-72 overflow-y-scroll overflow-x-hidden">
          {items.map((item, i) => {
            return (
              <BOM_item
                key={i}
                name={item.name}
                material={item.material}
                amount_spent={item.amount_spent}
                production_cost={item.production_cost}
                source={item.source}
                description={item.description}
                quantity={item.quantity.split(".")}
                sizes={sizes}
              />
            );
          })}
        </div>
      </div>
      <div
        className="relative grid gap-1 w-fit bg-t1 group z-50 mt-4 py-1 rounded-md mx-auto"
        style={{
          gridTemplateColumns:
            sizes[0] +
            sizes[1] +
            "px " +
            sizes[2] +
            "px " +
            sizes[3] +
            "px " +
            (sizes[4] + sizes[5] + 8) +
            "px",
        }}
      >
        {[
          "Total",
          "$92",
          "$239*",
          "*Production Cost Values from https://www.mcmaster.com/",
        ].map((item, i) => {
          return (
            <div
              key={i}
              className={`px-3 py-2 bg-t4 text-t1 font-extrabold ${
                i == 3 ? "text-[9px]" : "text-sm"
              } hv-t4 hv-bg-t1 transition-all shadow-[0px_0px_20px_#489Fb5ff_inset]`}
              style={{ textShadow: "1px 1px 12px #489Fb5ff" }}
            >
              {item}
            </div>
          );
        })}
        {[
          "Realistic Production Total",
          "-",
          "$155**",
          "**Realistic Production Total is 65% of Production Cost Total to account for bulk and production discounts.",
        ].map((item, i) => {
          return (
            <div
              key={i}
              className={`px-3 py-2 bg-t4 text-t1 font-extrabold ${
                i == 3 ? "text-[9px]" : "text-sm"
              } hv-t4 hv-bg-t1 transition-all shadow-[0px_0px_20px_#489Fb5ff_inset]`}
              style={{ textShadow: "1px 1px 12px #489Fb5ff" }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
