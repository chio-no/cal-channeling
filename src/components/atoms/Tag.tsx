import React from "react";

export const Tag: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="tag">{children}</span>
);
