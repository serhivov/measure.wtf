import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "./Editor";

export interface Image {
  file: any;
  width: number;
  height: number;
  data: any;
}

function Drop() {
  const [img, setImg] = React.useState<Image>();
  const [dropped, setDropped] = React.useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles) => {
    setDropped(true);
    const file = acceptedFiles.find(Boolean);
    const i = new Image();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      i.src = reader.result as string;
      i.onload = () => {
        setImg({
          file,
          width: i.width,
          height: i.height,
          data: reader.result,
        });
      };
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (img) {
    return <Editor img={img} />;
  } else {
    return (
      <div id="dropzone" {...getRootProps()}>
        {dropped ? (
          <span>Reading image data...</span>
        ) : (
          <>
            <input {...getInputProps()} />
            {isDragActive ? (
              <span>Nice. I can read that. Now drop it on here...</span>
            ) : (
              <span>Drag an image here, or click to browse for it</span>
            )}
          </>
        )}
      </div>
    );
  }
}

export default Drop;
