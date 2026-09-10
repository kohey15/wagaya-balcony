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
  // 植物は画面下部に集中させて配置し、横方向にだけ散らしている。
  var SLOT_POSITIONS = {
    slot01: { left: "50%", bottom: "0%", width: "24%" },
    slot02: { left: "20%", bottom: "1%", width: "28%" },
    slot03: { left: "80%", bottom: "1%", width: "28%" },
    slot04: { left: "5%", bottom: "3%", width: "24%" },
    slot05: { left: "95%", bottom: "3%", width: "24%" },
    slot06: { left: "35%", bottom: "4%", width: "20%" },
    slot07: { left: "65%", bottom: "4%", width: "20%" },
    slot08: { left: "15%", bottom: "6%", width: "18%" },
    slot09: { left: "85%", bottom: "6%", width: "18%" },
    slot10: { left: "50%", bottom: "8%", width: "18%" }
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
  // 植物選択シーンの背景（園芸店）。画像が未配置のうちはCSSのグラデーション
  // プレースホルダーがそのまま背景として見えるだけで、壊れたアイコンは出ない。
  // ここに実画像（例: assets/backgrounds/gardenshop.jpg）を用意すれば自動的に差し替わる。
  var PLANT_SELECT_BACKGROUND = "assets/backgrounds/gardenshop.jpg";

  // ゲーム全体は5つの基本シーンで構成される：
  // 1) オープニング（index.html） 2) 栽培シーン（ベランダ・通常時）
  // 3) 次の植物選択シーン（園芸店。じしんが一定を超えたら） 4) 収穫物の解説シーン（毎ターン）
  // 5) エンディングシーン（全7種類の植物をコンプリート＝ゲームクリアで1回だけ）
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
    PLANT_SELECT_BACKGROUND: PLANT_SELECT_BACKGROUND,
    SCENE_BACKGROUNDS: SCENE_BACKGROUNDS
  };
})();
