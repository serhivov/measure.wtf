export interface State {
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

export default reducer;
