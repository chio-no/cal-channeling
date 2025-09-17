const morseCodeObj: { [monoChar: string]: string[] } = {};
morseCodeObj["a"] = ["0", "1"];
morseCodeObj["b"] = "1000";
morseCodeObj["c"] = "1010";
morseCodeObj["d"] = "100";
morseCodeObj["e"] = "0";
morseCodeObj["f"] = "0010";
morseCodeObj["g"] = "110";
morseCodeObj["h"] = "0000";
morseCodeObj["i"] = "00";
morseCodeObj["j"] = "0111";
morseCodeObj["k"] = "101";
morseCodeObj["l"] = "0100";
morseCodeObj["m"] = "01";
morseCodeObj["n"] = "10";
morseCodeObj["o"] = "111";
morseCodeObj["p"] = "0110";
morseCodeObj["q"] = "1101";
morseCodeObj["r"] = "010";
morseCodeObj["s"] = "000";
morseCodeObj["t"] = "1";
morseCodeObj["u"] = "001";
morseCodeObj["v"] = "0001";
morseCodeObj["w"] = "011";
morseCodeObj["x"] = "1001";
morseCodeObj["y"] = "1011";
morseCodeObj["z"] = "1100";

export function morseConvert(originChar: string | undefined): string {
  let morse: string = "";

  if (typeof originChar == undefined) {
    return "empty";
  } else {
    //アンダーバーがあればその前をとる
    const underRemoveStr = originChar?.split("_")[0];

    //morseへの変換
    for (const char of underRemoveStr) {
      morse += morseCodeObj[char];
    }

    return morse;
  }
}
