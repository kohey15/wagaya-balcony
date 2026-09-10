/**
 * main.js
 * タイトル画面（index.html）専用のロジック。
 * この <script> はbody末尾で読み込まれるため、DOMは既に準備できている。
 * DOMContentLoadedイベント待ちにすると、環境によっては発火タイミングを
 * 取りこぼして初期化が走らないことがあるため、直接実行する。
 */
(function () {
  "use strict";

  var heroImage = document.getElementById("heroImage");
  if (heroImage) {
    heroImage.src = window.CONFIG.assetUrl(window.CONFIG.OPENING_IMAGE);
  }

  var continueBtn = document.getElementById("continueBtn");
  var newBtn = document.getElementById("newBtn");
  var hint = document.getElementById("saveHint");

  var hasSave = false;
  try {
    hasSave = window.Save.exists();
  } catch (err) {
    hasSave = false;
  }

  if (!hasSave) {
    continueBtn.disabled = true;
    continueBtn.classList.add("disabled");
    if (hint) hint.textContent = "セーブデータはまだありません。まずは「はじめから」";
  }

  newBtn.addEventListener("click", function () {
    var proceed = true;
    if (hasSave) {
      proceed = window.confirm("これまでの記録は消えて、最初からになります。よろしいですか？");
    }
    if (!proceed) return;
    window.location.href = "game.html?new=1";
  });

  continueBtn.addEventListener("click", function () {
    if (!hasSave) return;
    window.location.href = "game.html";
  });
})();
