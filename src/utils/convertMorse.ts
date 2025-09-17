const morseCodeObj: { [monoChar: string]: string[] } = {};
morseCodeObj["a"] = ["0", "1"];
morseCodeObj["b"] = ["1", "0", "0", "0"];
morseCodeObj["c"] = ["1", "0", "1", "0"];
morseCodeObj["d"] = ["1", "0", "0"];
morseCodeObj["e"] = ["0"];
morseCodeObj["f"] = ["0", "0", "1", "0"];
morseCodeObj["g"] = ["1", "1", "0"];
morseCodeObj["h"] = ["0", "0", "0", "0"];
morseCodeObj["i"] = ["0", "0"];
morseCodeObj["j"] = ["0", "1", "1", "1"];
morseCodeObj["k"] = ["1", "0", "1"];
morseCodeObj["l"] = ["0", "1", "0", "0"];
morseCodeObj["m"] = ["1", "1"];
morseCodeObj["n"] = ["1", "0"];
morseCodeObj["o"] = ["1", "1", "1"];
morseCodeObj["p"] = ["0", "1", "1", "0"];
morseCodeObj["q"] = ["1", "1", "0", "1"];
morseCodeObj["r"] = ["0", "1", "0"];
morseCodeObj["s"] = ["0", "0", "0"];
morseCodeObj["t"] = ["1"];
morseCodeObj["u"] = ["0", "0", "1"];
morseCodeObj["v"] = ["0", "0", "0", "1"];
morseCodeObj["w"] = ["0", "1", "1"];
morseCodeObj["x"] = ["1", "0", "0", "1"];
morseCodeObj["y"] = ["1", "0", "1", "1"];
morseCodeObj["z"] = ["1", "1", "0", "0"];

export function morseConvert(originChar: string | undefined): string[] {
  let morse: string[] = [];

  if (typeof originChar == undefined) {
    for (const char of "error") {
      morse.push(...morseCodeObj[char]);
    }
  } else {
    //アンダーバーがあればその前をとる
    const underRemoveStr = originChar?.split("_")[0];

    //morseへの変換
    for (const char of underRemoveStr) {
      morse.push(...morseCodeObj[char]);
    }
  }
  return morse;
}
