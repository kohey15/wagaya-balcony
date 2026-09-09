/**
 * main.js
 * タイトル画面（index.html）専用のロジック。
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();
