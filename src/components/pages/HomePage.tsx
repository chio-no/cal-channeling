import React, { useRef } from "react";
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
    <div
      onClick={handleContainerClick}
      style={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <NearestRestaurantInfo ref={nearestRestaurantInfoRef} />
    </div>
  );
};
