import React from "react";
import { MainTemplate } from "../templates/MainTemplate";
import { H1 } from "../atoms/Text";
import { NearestRestaurantInfo } from "../organisms/NearestRestaurantInfo";

export const HomePage: React.FC = () => {
  return (
    <MainTemplate>
      <header className="header">
        <H1>cal-channeling</H1>
      </header>
      <div style={{ height: 12 }} />
      <NearestRestaurantInfo />
    </MainTemplate>
  );
};
