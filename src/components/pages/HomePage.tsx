import React, { useRef } from "react";
import { MainTemplate } from "../templates/MainTemplate";
import { H1, P } from "../atoms/Text";
import {
  NearestRestaurantInfo,
  type NearestRestaurantInfoHandle,
} from "../organisms/NearestRestaurantInfo";

export const HomePage: React.FC = () => {
  const nearestRestaurantInfoRef = useRef<NearestRestaurantInfoHandle>(null);

  const handleContainerClick = () => {
    nearestRestaurantInfoRef.current?.handlePlayMorse();
  };

  return (
    <div onClick={handleContainerClick} style={{ cursor: "pointer" }}>
      <MainTemplate>
        <header className="header">
          <H1>cal-channeling</H1>
        </header>
        <div style={{ height: 12 }} />
        <NearestRestaurantInfo ref={nearestRestaurantInfoRef} />
      </MainTemplate>
    </div>
  );
};
