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
  // slot01〜slot10 まで将来追加可能。
  // 中央下は父と娘のイラスト（char-family）が占めるため、鉢は両脇と
  // 手前の隙間に配置し、顔や体に重ならないようにしている。
  var SLOT_POSITIONS = {
    slot01: { left: "44%", bottom: "0%", width: "17%" },
    slot02: { left: "13%", bottom: "3%", width: "24%" },
    slot03: { left: "87%", bottom: "3%", width: "24%" },
    slot04: { left: "8%", bottom: "24%", width: "18%" },
    slot05: { left: "92%", bottom: "24%", width: "18%" },
    slot06: { left: "22%", bottom: "42%", width: "16%" },
    slot07: { left: "78%", bottom: "42%", width: "16%" },
    slot08: { left: "50%", bottom: "56%", width: "16%" },
    slot09: { left: "35%", bottom: "58%", width: "14%" },
    slot10: { left: "65%", bottom: "58%", width: "14%" }
  };

  var CHARACTER_ASSETS = {
    mother: { image: "assets/characters/mother.webp", emojiFallback: "👩" },
    // 父と娘は、しゃがんで一緒にベランダを眺める1枚のイラストにまとめて表示する
    family: { image: "assets/characters/family_cultivating.webp", emojiFallback: "👨‍👧" }
  };

  var BACKGROUND_ASSET = "assets/backgrounds/balcony.jpg";
  var OPENING_IMAGE = "assets/backgrounds/opening.jpg";
  var FERTILIZER_BUTTON_IMAGE = "assets/ui/hiryou.webp";
  var WATER_BUTTON_IMAGE = "assets/ui/mizuyari.webp";

  // 特定の会話シーン中だけ、ベランダの背景を差し替える先
  var SCENE_BACKGROUNDS = {
    nutrition: "assets/backgrounds/kaisetu.jpg",
    meal: "assets/backgrounds/syokuji.jpg"
  };

  return {
    SAVE_KEY: SAVE_KEY,
    DATA_PATHS: DATA_PATHS,
    SLOT_POSITIONS: SLOT_POSITIONS,
    CHARACTER_ASSETS: CHARACTER_ASSETS,
    BACKGROUND_ASSET: BACKGROUND_ASSET,
    OPENING_IMAGE: OPENING_IMAGE,
    FERTILIZER_BUTTON_IMAGE: FERTILIZER_BUTTON_IMAGE,
    WATER_BUTTON_IMAGE: WATER_BUTTON_IMAGE,
    SCENE_BACKGROUNDS: SCENE_BACKGROUNDS
  };
})();
