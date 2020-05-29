import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

function Drop() {
  const [img, setImg] = React.useState<string>();
  const [dropped, setDropped] = React.useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles) => {
    setDropped(true);
    const reader = new FileReader();
    reader.onload = function (e) {
      setImg(e?.target?.result as string);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (img) {
    return <img src={img} draggable={false} />;
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
