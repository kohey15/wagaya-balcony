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
  // キャラクターとの重なり順はランダム（前後どちらにもなる）なので、
  // 鉢は見栄えを優先して大きめに配置している。
  var SLOT_POSITIONS = {
    slot01: { left: "44%", bottom: "0%", width: "26%" },
    slot02: { left: "13%", bottom: "3%", width: "32%" },
    slot03: { left: "87%", bottom: "3%", width: "32%" },
    slot04: { left: "8%", bottom: "24%", width: "26%" },
    slot05: { left: "92%", bottom: "24%", width: "26%" },
    slot06: { left: "22%", bottom: "42%", width: "24%" },
    slot07: { left: "78%", bottom: "42%", width: "24%" },
    slot08: { left: "50%", bottom: "56%", width: "22%" },
    slot09: { left: "35%", bottom: "58%", width: "20%" },
    slot10: { left: "65%", bottom: "58%", width: "20%" }
  };

  var CHARACTER_ASSETS = {
    mother: { image: "assets/characters/mother.webp" },
    // 父と娘は、しゃがんで一緒にベランダを眺める1枚のイラストにまとめて表示する
    family: { image: "assets/characters/family_cultivating.webp" }
  };

  var BACKGROUND_ASSET = "assets/backgrounds/balcony.jpg";
  var OPENING_IMAGE = "assets/backgrounds/opening.jpg";
  var FERTILIZER_BUTTON_IMAGE = "assets/ui/hiryou.webp";
  var WATER_BUTTON_IMAGE = "assets/ui/mizuyari.webp";
  // 鉢選択シーンで、選択ウインドウと重ならない側に添える父と娘のイラスト
  var PLANT_SELECT_IMAGE = "assets/characters/select_family.webp";

  // ゲーム全体は5つの基本シーンで構成される：
  // 1) オープニング（index.html） 2) 栽培シーン（ベランダ・通常時）
  // 3) 次の植物選択シーン（じしんが一定を超えたら） 4) 収穫物の解説シーン
  // 5) エンディングシーン（じしんが最大まで育ったら1回だけ）
  // ここでは 3〜5 の会話シーン中に切り替えるベランダ背景を定義する。
  var SCENE_BACKGROUNDS = {
    nutrition: "assets/backgrounds/kaisetu.jpg",
    ending: "assets/backgrounds/syokuji.jpg"
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
    PLANT_SELECT_IMAGE: PLANT_SELECT_IMAGE,
    SCENE_BACKGROUNDS: SCENE_BACKGROUNDS
  };
})();
