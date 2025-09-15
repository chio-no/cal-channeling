import React from "react";
import { MainTemplate } from "../templates/MainTemplate";
import { H1, SmallMuted } from "../atoms/Text";
import { NearestRestaurantInfo } from "../organisms/NearestRestaurantInfo";

export const HomePage: React.FC = () => {
  return (
    <MainTemplate>
      <header className="header">
        <H1>現在地から最も近い飲食店</H1>
      </header>
      <SmallMuted>
        位置情報の許可が必要です。結果はテキストのみで表示します（地図は表示しません）。
      </SmallMuted>
      <div style={{ height: 12 }} />
      <NearestRestaurantInfo />
    </MainTemplate>
  );
};
