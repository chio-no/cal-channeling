import React from "react";

export const KeyValueList: React.FC<React.PropsWithChildren> = ({
  children,
}) => <dl className="kv">{children}</dl>;
