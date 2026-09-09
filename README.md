# わが家のベランダ（MVP 0.1）

種から育てる園芸ゲームではなく、
**すでに収穫できる大株の鉢植えを迎え、初日から収穫を楽しみながら、
水や肥料でお世話をして長く楽しむ**、という商品体験をゲーム化したものです。

ゲームで育つメインパラメータは植物ではなく、娘の「じしん」です。
植物は基本的に枯れません。「失敗を罰する」のではなく
「お世話をすると、もっと長く楽しめる」という思想で作られています。

エンジン・フレームワーク不使用（HTML5 / CSS3 / Vanilla JS / JSON / localStorage のみ）。
ビルド工程なしで Cloudflare Pages にそのまま配置できる静的サイトです。

---

## 作成したファイル一覧

```
/
├ index.html          … タイトル画面（はじめから／つづきから）
├ game.html           … ゲーム本編
├ about.html          … コンセプト説明
├ plants.html         … 植物図鑑（商品リンクのプレースホルダー含む）
├ css/
│  ├ common.css       … 全ページ共通のリセット・ボタン・レイアウト
│  └ game.css         … ゲーム画面専用レイアウト（1画面に収める配分）
├ js/
│  ├ config.js        … 定数（保存キー、データパス、鉢スロット座標など）
│  ├ save.js          … localStorage の読み書き・破損データ対策
│  ├ events.js        … data/events.json からセリフを選ぶヘルパー
│  ├ game.js          … ゲームロジック本体（DOM操作なし）
│  ├ ui.js            … 画面描画・イベント処理（ロジックはgame.jsに委譲）
│  └ main.js          … タイトル画面（index.html）専用の処理
├ data/
│  ├ plants.json      … 植物データ（水菜／ミニトマト／バジル、画像パス・商品URLなど）
│  ├ events.json      … 会話データ（導入・収穫・お世話・翌日・鉢追加など）
│  └ balance.json      … ゲームバランス数値（じしん・元気の増減、鉢追加のしきい値など）
├ .assetsignore       … デプロイ時に.gitなどを公開アセットから除外
├ assets/
│  ├ backgrounds/     … 背景画像を置く場所（.gitkeepのみ）
│  ├ characters/      … 父・娘の画像を置く場所
│  ├ plants/          … 植物画像を置く場所
│  ├ food/            … 将来の収穫物・料理画像用
│  └ ui/              … 将来のアイコン等用
└ README.md
```

---

## 実装済み機能（MVP 0.1）

- [x] DAY表示（1日〜、5日目以降も継続プレイ可）
- [x] 娘の「じしん」（数値・進捗バー・称号表示）
- [x] 植物状態（😊 / 🙂 / 😐 の3段階、数値非表示、枯れない）
- [x] 収穫は自動（DAY開始時にその日まだ収穫していない鉢をまとめて収穫し、セリフで結果を伝える。プレイヤー操作は不要）
- [x] 水をあげる／肥料をあげる（コマンドはこの2つのみ。1日1回どちらか一方）
- [x] 父娘の短い会話（タップで送るダイアログボックス）
- [x] DAY1導入会話 →「これ、とっていい？」→（自動収穫）→「わたしがとれた！」→ じしんUP
- [x] localStorageへの自動保存（`wagaya_balcony_save_v1`、状態変化のたびに保存）
- [x] はじめから（確認ダイアログ付きリセット）
- [x] つづきから（保存データが無い場合はボタン無効化）
- [x] スマホ縦画面レイアウト（360〜430px）／PCは480px中央寄せ／ゲーム画面はスマホ横向きにも対応（ステージ＋右カラムの2カラム構成に自動切り替え）
- [x] 背景・キャラクター・植物の別レイヤー表示、鉢は固定スロット方式（slot01〜10 まで拡張可能な座標定義済み、MVPではslot01のみ使用）
- [x] 画像未配置時はCSS/絵文字によるプレースホルダー表示（壊れた画像アイコンを出さない）
- [x] 植物図鑑ページ（about.html / plants.html）
- [x] 「本物の鉢を見てみる」リンク（productUrlはプレースホルダー）
- [x] エラー時にゲーム全体が停止しないようにtry/catch・読み込み失敗表示を実装
- [x] 壊れた/不正なlocalStorageデータへの耐性（形式チェック→新規ゲームにフォールバック）
- [x] じしんが称号のしきい値を超えた瞬間のお祝いセリフ＋バーが光る演出（Ver0.2）
- [x] DAY6・DAY10の節目イベント＋DAY7以降はランダムな汎用会話プールで会話が尽きない（Ver0.2）
- [x] 元気が少ない状態で新しい日を迎えると、父からやさしく声をかける一言（罰ではなく誘導）＋植物の彩度をわずかに下げる控えめな表現（Ver0.2）
- [x] じしんが一定のしきい値（`balance.json`の`potUnlockThresholds`）を超えると「新しい鉢を迎えるシーン」に移行し、未所持の植物から選んで鉢を追加できる（Ver0.2）
- [x] コマンドを「水をあげる」「肥料をあげる」の2つに簡略化し、収穫は自動化（Ver0.2）

## 未実装機能（Ver 0.2以降に持ち越し）

- 実際の画像素材（現在は絵文字プレースホルダー）
- お世話をしないまま長期間放置した場合の追加演出
- サウンド・BGM
- 日本語以外の言語対応
- タイトル画面や図鑑ページのビジュアル強化

## Cloudflare Pagesへの公開手順

1. このフォルダ（`wagaya-balcony/`）の中身をGitHubリポジトリのルートとしてpushする。
2. Cloudflare Dashboard →「Workers & Pages」→「Pages」→「Create a project」→「Connect to Git」。
3. 対象リポジトリを選択。
4. ビルド設定：
   - Build command: 空欄のまま（ビルド不要）
   - Build output directory: `/`（リポジトリ直下）
5. 「Save and Deploy」を実行。
6. 発行されたURLで `index.html` が表示されればOK。

## 画像の配置方法

`assets/` 以下の各フォルダに、対応する画像ファイル（WebP推奨、背景は透過不要・植物とキャラは透過PNG/WebP）を置き、
`data/plants.json` と `js/config.js` 内のパスと **同じファイル名** で保存するだけで反映されます。

| 用途 | 配置先 | 参照元 |
| --- | --- | --- |
| ベランダ背景 | `assets/backgrounds/balcony.webp` | `js/config.js` の `BACKGROUND_ASSET` |
| 父の立ち絵 | `assets/characters/father.webp` | `js/config.js` の `CHARACTER_ASSETS.father` |
| 娘の立ち絵 | `assets/characters/daughter.webp` | `js/config.js` の `CHARACTER_ASSETS.daughter` |
| 水菜の画像（透過） | `assets/plants/mizuna.webp` | `data/plants.json` の `mizuna.image` |
| ほうれん草の画像（透過） | `assets/plants/hourensou.webp` | `data/plants.json` の `hourensou.image` |
| いちごの画像（透過） | `assets/plants/ichigo.webp` | `data/plants.json` の `ichigo.image` |
| 茎ブロッコリーの画像（透過） | `assets/plants/kukibrokkori.webp` | `data/plants.json` の `kukibrokkori.image` |
| アイスプラントの画像（透過） | `assets/plants/iceplant.webp` | `data/plants.json` の `iceplant.image` |
| バジルの画像（透過） | `assets/plants/basil.webp` | `data/plants.json` の `basil.image` |
| パセリの画像（透過） | `assets/plants/parsley.webp` | `data/plants.json` の `parsley.image` |

画像が無い間は絵文字で代替表示されるため、ファイルを未配置のまま公開しても壊れたアイコンは表示されません。

## 鉢の追加（じしん連動の解放）の仕組み

- 植物ラインナップは全7種：水菜／ほうれん草／いちご／茎ブロッコリー／アイスプラント／バジル／パセリ。
- `data/plants.json` の各植物には `starter: true/false` があり、`true` の植物（水菜）だけが1日目から所持済み。残り6種が選択候補。
- `data/balance.json` の `potUnlockThresholds`（既定 `[15, 30, 45, 60, 75, 90]`）は、じしんがこの値を超えるたびに「まだ持っていない植物」を選ぶシーンへ移行する、という設定。6種の候補に対応して6段階のしきい値を用意している。
- 新しい植物を追加したいときは、`plants.json` に `starter: false` のエントリを増やし、`assets/plants/`に画像を置くだけでよい（スロットへの配置は自動）。
- 会話文言は `data/events.json` の `potUnlockAnnounce`（解放告知）・`newPotWelcome`（お迎え時、`{name}`は植物名に置換される）で調整可能。

## 次に実装すべき Ver 0.3 の内容

1. **実画像への差し替え**：`assets/`配下にWebP画像を配置するだけで見た目が完成する。
2. **収穫物の活用**：`assets/food/`を使い、収穫した野菜が食卓に並ぶような簡易演出を追加。
3. **お世話忘れ時の会話バリエーション**：元気が下がった状態専用のセリフをさらに追加。
4. **EC連携の実装確認**：実際のSTORES/BASEの商品URLに差し替え、動作確認。
5. **鉢が増えた後の演出強化**：ベランダが賑やかになっていく様子を称号やHUDでも表現する。
