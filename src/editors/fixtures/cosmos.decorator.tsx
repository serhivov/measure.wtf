import React from "react";
import "../../style.scss";

const Decorator: React.FC = ({ children }) => {
  return <div id="root">{children}</div>;
};

export default Decorator;
