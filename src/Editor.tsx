import useDocumentTitle from "@rehooks/document-title";
import React, { useReducer } from "react";
import { Image } from "./Drop";

interface Point {
  x: number;
  y: number;
}

const clicksReducer = (points: Point[], action: any) => {
  switch (action.type) {
    case "click":
      if (points.length === 2) {
        const actualDistance = prompt("How far is that? e.g. 350 feet");
        const match = actualDistance?.match(/(\d+)/);
        if (match) {
          const dist = distance(points[0], points[1]);
          const actualDistanceNumber = Number(match[1]);
          alert(
            `${dist} units = ${actualDistance} \n\n 1 unit = ${
              actualDistanceNumber / dist
            }${actualDistance?.replace(match[1], "")}`
          );
        }
      }
      return [...points, action.payload];
    case "move":
      if (points.length > 0) {
        return [points[0], action.payload];
      } else {
        return points;
      }
    default:
      throw new Error();
  }
};

const distance = (pt1: Point, pt2: Point): number =>
  Math.hypot(pt2.x - pt1.x, pt2.y - pt1.y);

const Editor: React.FC<{ img: Image }> = ({ img }) => {
  useDocumentTitle(`📏 <${img.file.name}>`);

  const [points, dispatch] = useReducer(clicksReducer, []);

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={img.width}
      height={img.height}
      // style={{ cursor: "none" }}
    >
      <g
        onMouseMove={(event) =>
          dispatch({
            type: "move",
            payload: { x: event.clientX, y: event.clientY },
          })
        }
        onClick={(event) =>
          dispatch({
            type: "click",
            payload: { x: event.clientX, y: event.clientY },
          })
        }
      >
        <image width={img.width} height={img.height} xlinkHref={img.data} />
        <g>
          {points.length > 0 && (
            <>
              <circle cx={points[0].x} cy={points[0].y} r={5} fill="white" />
              <circle cx={points[0].x} cy={points[0].y} r={3} fill="hotpink" />
            </>
          )}
          {points.length === 2 && (
            <>
              <circle cx={points[1].x} cy={points[1].y} r={5} fill="white" />
              <circle cx={points[1].x} cy={points[1].y} r={3} fill="hotpink" />

              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke="white"
                strokeWidth={5}
              />
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                strokeWidth={2}
                stroke="hotpink"
              />

              <text
                x={points[1].x}
                y={points[1].y - 20}
                style={{ stroke: "white", strokeWidth: 6 }}
              >
                {distance(points[0], points[1]).toFixed(2)}
              </text>
              <text
                x={points[1].x}
                y={points[1].y - 20}
                style={{ fill: "black" }}
              >
                {distance(points[0], points[1]).toFixed(2)}
              </text>
            </>
          )}
        </g>
      </g>
    </svg>
  );
};

export default Editor;
