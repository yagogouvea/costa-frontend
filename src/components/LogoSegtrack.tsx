import React, { useState } from "react";

interface LogoSegtrackProps {
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  variant?: "original" | "default";
}

const LOGO_PATHS = {
  default: ["/uploads/Logo-segtrack.png", "/api/uploads/Logo-segtrack.png"],
  original: ["/uploads/Logo-segtrack-original.png", "/api/uploads/Logo-segtrack-original.png"],
};

export const LogoSegtrack: React.FC<LogoSegtrackProps> = ({
  className = "",
  style = {},
  alt = "Logo Segtrack",
  variant = "default",
}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const paths = LOGO_PATHS[variant];

  return (
    <img
      src={paths[srcIndex]}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (srcIndex < paths.length - 1) setSrcIndex(srcIndex + 1);
      }}
      draggable={false}
    />
  );
};

export default LogoSegtrack; 