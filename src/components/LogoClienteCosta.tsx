import React from "react";

interface LogoClienteCostaProps {
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const LogoClienteCosta: React.FC<LogoClienteCostaProps> = ({
  className = "",
  style = {},
  alt = "Logo Cliente Costa",
}) => {
  return (
    <img
      src="/assets/LOGOCOSTA.png"
      alt={alt}
      className={className}
      style={style}
      draggable={false}
    />
  );
};

export default LogoClienteCosta;
