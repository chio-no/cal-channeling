import React from "react";

export const DistanceLine: React.FC<{ text: string }> = ({ text }) => (
  <p>
    <strong>距離:</strong> {text}
  </p>
);
