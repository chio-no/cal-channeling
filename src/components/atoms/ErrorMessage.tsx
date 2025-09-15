import React from "react";

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p role="alert" className="error">
    エラー: {message}
  </p>
);
