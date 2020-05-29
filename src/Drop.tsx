import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Image {
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
    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={img.width}
        height={img.height}
      >
        <image width={img.width} height={img.height} xlinkHref={img.data} />
      </svg>
    );
  } else {
    return (
      <div id="dropzone" {...getRootProps()}>
        {dropped ? (
          <span>Reading image data...</span>
        ) : (
          <>
            <input {...getInputProps()} />
            {isDragActive ? (
              <span>You got it. Now drop it here...</span>
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
