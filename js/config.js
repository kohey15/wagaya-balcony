/**
 * config.js
 * アプリ全体の定数（保存キー、データパス、画像スロット座標など）。
 * ここを変更すれば、ロジックに触れずにレイアウトや保存先を調整できる。
 */
window.CONFIG = (function () {
  "use strict";

  var SAVE_KEY = "wagaya_balcony_save_v1";

  var DATA_PATHS = {
    plants: "data/plants.json",
    events: "data/events.json",
    balance: "data/balance.json"
  };

  // 鉢の固定スロット位置（ベランダ舞台に対する割合位置）。
  // slot01〜slot10 まで将来追加可能。MVPでは slot01 のみ使用。
  var SLOT_POSITIONS = {
    slot01: { left: "50%", bottom: "8%", width: "46%" },
    slot02: { left: "14%", bottom: "6%", width: "30%" },
    slot03: { left: "86%", bottom: "6%", width: "30%" },
    slot04: { left: "30%", bottom: "4%", width: "26%" },
    slot05: { left: "70%", bottom: "4%", width: "26%" },
    slot06: { left: "50%", bottom: "30%", width: "24%" },
    slot07: { left: "20%", bottom: "28%", width: "22%" },
    slot08: { left: "80%", bottom: "28%", width: "22%" },
    slot09: { left: "35%", bottom: "50%", width: "20%" },
    slot10: { left: "65%", bottom: "50%", width: "20%" }
  };

  var CHARACTER_ASSETS = {
    father: { image: "assets/characters/father.webp", emojiFallback: "👨" },
    daughter: { image: "assets/characters/daughter.webp", emojiFallback: "👧" }
  };

  var BACKGROUND_ASSET = "assets/backgrounds/balcony.webp";

  return {
    SAVE_KEY: SAVE_KEY,
    DATA_PATHS: DATA_PATHS,
    SLOT_POSITIONS: SLOT_POSITIONS,
    CHARACTER_ASSETS: CHARACTER_ASSETS,
    BACKGROUND_ASSET: BACKGROUND_ASSET
  };
})();
