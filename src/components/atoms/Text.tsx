import React from "react";

export const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h1 className="h1">{children}</h1>
);

export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h2 className="h2">{children}</h2>
);

export const P: React.FC<React.PropsWithChildren> = ({ children }) => (
  <p>{children}</p>
);

export const SmallMuted: React.FC<React.PropsWithChildren> = ({ children }) => (
  <p className="small">{children}</p>
);
