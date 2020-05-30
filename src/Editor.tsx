import useDocumentTitle from "@rehooks/document-title";
import React, { useReducer, useRef, useState } from "react";
import { Image } from "./Drop";

interface State {
  scaleFactor?: number;
  points: Point[];
  matrix: number[];
  dragging: boolean;
  viewport: {
    width: number;
    height: number;
  };
}

interface Point {
  x: number;
  y: number;
}

const reducer = (state: State, action: any) => {
  const { points, scaleFactor, matrix, viewport } = state;

  switch (action.type) {
    case "click":
      // if (points.length === 2 && !scaleFactor) {
      //   const actualDistance = prompt("How far is that? e.g. 350 feet");
      //   const match = actualDistance
      //     ?.replace(/([^\d-\.]*)/g, "")
      //     ?.match(/[+-]?\d+(?:\.\d+)?/gi);

      //   if (match) {
      //     const dist = distance(points[0], points[1]);
      //     const actualDistanceNumber = Number(match[0]);
      //     alert(
      //       `${dist} units = ${actualDistance} \n\n ${actualDistanceNumber} \n\n 1 unit = ${
      //         actualDistanceNumber / dist
      //       }${actualDistance?.replace(match[0], "")}`
      //     );
      //   }
      // }
      // return {
      //   ...state,
      //   points: [...points, action.payload],
      // };
      return state;
    case "move":
      // if (points.length > 0) {
      //   return {
      //     ...state,
      //     points: [points[0], action.payload],
      //   };
      // } else {
      //   return state;
      // }
      return state;
    case "zoom":
      // const len = matrix.length;

      const newMatrix = [...matrix];

      for (let i = 0; i < 4; i++) {
        newMatrix[i] *= action.delta;
      }

      const [hCenter, vCenter] = [viewport.width / 2, viewport.height / 2];

      newMatrix[4] = (1 - action.delta) * hCenter;
      newMatrix[5] = (1 - action.delta) * vCenter;

      return {
        ...state,
        matrix: newMatrix,
      };
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

const getTransformToElement = (elem: any) =>
  elem.getScreenCTM().inverse().multiply(elem.getScreenCTM());

const Editor: React.FC<{ img: Image }> = ({ img }) => {
  useDocumentTitle(`📏 <${img.file.name}>`);

  const [{ points, matrix, scaleFactor, viewport }, dispatch] = useReducer(
    reducer,
    {
      points: [],
      matrix: [1, 0, 0, 1, 0, 0],
      dragging: false,
      viewport: {
        width: 800,
        height: 600,
      },
    }
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const [mousePos, setMousePos] = useState([0, 0]);

  return (
    <div id="editor">
      <svg
        ref={svgRef}
        id="svg"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={[0, 0, img.width, img.height].join(" ")}
        onClick={(event) =>
          dispatch({
            type: "click",
            payload: extractPoint(event),
          })
        }
        onWheel={(e) => {
          if (e.deltaY < 0) {
            dispatch({
              type: "zoom",
              delta: 1.05,
            });
          } else {
            dispatch({
              type: "zoom",
              delta: 0.95,
            });
          }
        }}
        onMouseMove={(event: React.MouseEvent) => {
          const svg = svgRef.current;
          const group = groupRef.current;
          if (svg && group) {
            const pt = svg.createSVGPoint();
            pt.x = event.clientX;
            pt.y = event.clientY;

            const gPt = group.getScreenCTM();

            if (gPt !== null) {
              const { x, y } = pt.matrixTransform(gPt.inverse());
              setMousePos([x, y]);
            }
          }
        }}
      >
        <g transform={`matrix(${matrix.join(" ")})`} ref={groupRef}>
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
      <div id="info">{JSON.stringify(mousePos.map((p) => p.toFixed(2)))}</div>
    </div>
  );
};

export default Editor;
