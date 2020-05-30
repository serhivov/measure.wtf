import useDocumentTitle from "@rehooks/document-title";
import React, { useReducer } from "react";
import { Image } from "./Drop";

interface State {
  scaleFactor?: number;
  points: Point[];
}

interface Point {
  x: number;
  y: number;
}

const reducer = (state: State, action: any) => {
  const { points, scaleFactor } = state;

  switch (action.type) {
    case "click":
      if (points.length === 2 && !scaleFactor) {
        const actualDistance = prompt("How far is that? e.g. 350 feet");
        const match = actualDistance
          ?.replace(/([^\d-\.]*)/g, "")
          ?.match(/[+-]?\d+(?:\.\d+)?/gi);

        if (match) {
          const dist = distance(points[0], points[1]);
          const actualDistanceNumber = Number(match[0]);
          alert(
            `${dist} units = ${actualDistance} \n\n ${actualDistanceNumber} \n\n 1 unit = ${
              actualDistanceNumber / dist
            }${actualDistance?.replace(match[0], "")}`
          );
        }
      }
      return {
        ...state,
        points: [...points, action.payload],
      };
    case "move":
      if (points.length > 0) {
        return {
          ...state,
          points: [points[0], action.payload],
        };
      } else {
        return state;
      }
    default:
      throw new Error();
  }
};

const distance = (pt1: Point, pt2: Point): number =>
  Math.hypot(pt2.x - pt1.x, pt2.y - pt1.y);

const extractPoint = (event: React.MouseEvent): Point => ({
  x: event.clientX,
  y: event.clientY,
});

const Editor: React.FC<{ img: Image }> = ({ img }) => {
  useDocumentTitle(`📏 <${img.file.name}>`);

  const [{ points, scaleFactor }, dispatch] = useReducer(reducer, {
    points: [],
  });

  return (
    <>
      <svg
        id="svg"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={img.width}
        height={img.height}
      >
        <g
          onMouseMove={(event) =>
            dispatch({
              type: "move",
              payload: extractPoint(event),
            })
          }
          onClick={(event) =>
            dispatch({
              type: "click",
              payload: extractPoint(event),
            })
          }
        >
          <image width={img.width} height={img.height} xlinkHref={img.data} />

          <g>
            {points.length > 0 && (
              <>
                <circle cx={points[0].x} cy={points[0].y} r={5} fill="white" />
                <circle
                  cx={points[0].x}
                  cy={points[0].y}
                  r={3}
                  fill="hotpink"
                />
              </>
            )}
            {points.length === 2 && (
              <>
                <circle cx={points[1].x} cy={points[1].y} r={5} fill="white" />
                <circle
                  cx={points[1].x}
                  cy={points[1].y}
                  r={3}
                  fill="hotpink"
                />

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
      {scaleFactor && <div>Scale Factor: {scaleFactor}</div>}
    </>
  );
};

export default Editor;
