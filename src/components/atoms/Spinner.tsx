import React from "react";

export const Spinner: React.FC = () => (
  <div aria-busy="true" aria-live="polite" className="small">
    読み込み中…
  </div>
);
