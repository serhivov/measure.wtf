import useDocumentTitle from "@rehooks/document-title";
import React, { useEffect, useReducer, useRef } from "react";
import { Image } from "./Drop";
import ViewingTransformer from "./lib/viewingTransformer";

interface State {
  scaleFactor?: number;
  points: Point[];
  matrix: number[];
  dragging: boolean;
  viewport: {
    width: number;
    height: number;
  };
  position: Point;
  startPosition: Point;
  svgRef: React.RefObject<SVGSVGElement>;
  groupRef: React.RefObject<SVGGElement>;
}

export interface Point {
  x: number;
  y: number;
}

const reducer = (state: State, action: any) => {
  const { matrix, dragging, startPosition, position } = state;

  switch (action.type) {
    case "move":
      const position2 = { x: action.x, y: action.y };
      if (dragging) {
        const dx = position2.x - startPosition.x;
        const dy = position2.y - startPosition.y;

        const newMatrix = [...matrix];
        newMatrix[4] += dx;
        newMatrix[5] += dy;

        return {
          ...state,
          position: position2,
          matrix: newMatrix,
        };
      } else {
        return {
          ...state,
          position: position2,
        };
      }

    case "down":
      return {
        ...state,
        startPosition: position,
        dragging: true,
      };

    case "up":
      return {
        ...state,
        dragging: false,
      };

    case "matrix":
      return {
        ...state,
        matrix: action.payload,
      };

    case "zoom":
      const newMatrix = [...matrix];

      for (let i = 0; i < 4; i++) {
        newMatrix[i] = newMatrix[i] * action.delta;
      }

      // const [hCenter, vCenter] = [viewport.width / 2, viewport.height / 2];

      newMatrix[4] = (1 - action.delta) * position.x;
      newMatrix[5] = (1 - action.delta) * position.y;

      return {
        ...state,
        matrix: newMatrix,
      };

    default:
      throw new Error(`${action.type} not supported`);
  }
};

const distance = (pt1: Point, pt2: Point): number =>
  Math.hypot(pt2.x - pt1.x, pt2.y - pt1.y);

let viewingTransformer: ViewingTransformer;

const Editor: React.FC<{ img: Image }> = ({ img }) => {
  useDocumentTitle(`📏 <${img.file.name}>`);

  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);

  const [{ points, matrix, position, dragging }, dispatch] = useReducer(
    reducer,
    {
      points: [],
      matrix: [1, 0, 0, 1, 0, 0],
      dragging: false,
      viewport: {
        width: 800,
        height: 600,
      },
      position: {
        x: 0,
        y: 0,
      },
      startPosition: {
        x: 0,
        y: 0,
      },
      svgRef,
      groupRef,
    }
  );

  useEffect(() => {
    const mouseUp = () => dispatch({ type: "up" });

    window.addEventListener("blur", mouseUp);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("pointerup", mouseUp);
    return () => {
      window.removeEventListener("blur", mouseUp);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("pointerup", mouseUp);
    };
  });

  return (
    <div id="editor">
      <svg
        ref={svgRef}
        id="svg"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={[0, 0, img.width, img.height].join(" ")}
        onMouseDown={() => dispatch({ type: "down" })}
        onWheel={(e) => {
          const svg = svgRef.current;
          const group = groupRef.current;
          if (svg && group) {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;

            const gPt = group.getScreenCTM();

            if (gPt !== null) {
              const { x, y } = pt.matrixTransform(gPt.inverse());

              dispatch({
                type: "move",
                x,
                y,
              });

              viewingTransformer =
                viewingTransformer || new ViewingTransformer(svg);

              const dir = e.deltaY < 0 ? 1 : -1;
              const xFactor = 1 + 0.1 * dir;
              const yFactor =
                (xFactor * svg.height.baseVal.value) / svg.width.baseVal.value;

              const mat = viewingTransformer.scale(xFactor, yFactor, { x, y });

              dispatch({
                type: "matrix",
                payload: [mat.a, mat.b, mat.c, mat.d, mat.e, mat.f],
              });
            }

            // group.transform.baseVal.getItem(0).setMatrix(mat);
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

              dispatch({
                type: "move",
                x,
                y,
              });
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
      <div id="info">{JSON.stringify({ dragging, position })}</div>
    </div>
  );
};

export default Editor;
