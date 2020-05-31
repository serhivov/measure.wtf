import { Stage as KonvaStage } from "konva/types/Stage";
import { Vector2d } from "konva/types/types";
import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Layer, Stage, Star } from "react-konva";
import { Image as ImageType } from "../Drop";

const scaleBy = 1.02;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;

// https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
// https://stackblitz.com/edit/multi-touch-trackpad-gesture

const Canvas: React.FC<{ img: ImageType }> = ({ img }) => {
  const [stage, setStage] = useState<KonvaStage>();
  const [points, setPoints] = useState<Vector2d[]>([]);

  useEffect(() => {
    setPoints(
      [...Array(20)].map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
    );

    window.addEventListener("gesturestart", function (e) {
      e.preventDefault();
      // startX = e.pageX - posX;
      // startY = e.pageY - posY;
      // gestureStartRotation = rotation;
      // gestureStartScale = scale;
    });

    window.addEventListener("gesturechange", function (e: any) {
      e.preventDefault();

      // rotation = gestureStartRotation + e.rotation;
      // scale = gestureStartScale * e.scale;

      // posX = e.pageX - startX;
      // posY = e.pageY - startY;

      console.log(e.scale);

      // render();
    });

    window.addEventListener("gestureend", function (e) {
      e.preventDefault();
    });
  }, []);

  const image = new Image();
  image.src = img.data;

  return (
    <Stage
      ref={(ref) => setStage(ref as any)}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={() => {
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          setPoints([...points, pointer]);
          console.log(pointer);
        }
      }}
      onWheel={(e) => {
        e.evt.preventDefault();

        if (!stage) return;
        if (!e.evt.ctrlKey) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (pointer) {
          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };

          const newScale = Math.min(
            MAX_SCALE,
            Math.max(
              MIN_SCALE,
              e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
            )
          );

          stage.scale({ x: newScale, y: newScale });

          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };

          stage.position(newPos);
          stage.batchDraw();
        }
      }}
    >
      <Layer>
        <KonvaImage
          x={0}
          y={0}
          image={image}
          width={image.width}
          height={image.height}
        />
      </Layer>

      <Layer>
        {points?.map((point) => (
          <Star
            key={JSON.stringify(point)}
            x={point.x}
            y={point.y}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            draggable={false}
            rotation={Math.random() * 180}
            // shadowColor="black"
            // shadowBlur={10}
            // shadowOpacity={0.6}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
