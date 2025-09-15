import React from "react";

interface Props {
  label: string;
  value?: React.ReactNode;
}

export const TextRow: React.FC<Props> = ({ label, value }) => (
  <>
    <dt>{label}</dt>
    <dd>{value ?? "-"}</dd>
  </>
);
