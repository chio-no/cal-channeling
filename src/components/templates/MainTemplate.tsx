import React from "react";

export const MainTemplate: React.FC<React.PropsWithChildren> = ({
  children,
}) => <div className="container">{children}</div>;
