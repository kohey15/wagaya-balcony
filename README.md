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
├ tips.html           … 栽培のコツ（全植物コンプリートで解放）
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
- [x] 水をあげる／肥料をあげる（コマンドはこの2つのみ。1日1回どちらか一方、これが唯一の日を進める手段）。選ぶと会話が自動で進み、収穫して翌日になるところまで一続きで進行する（Ver0.2）
- [x] 会話が流れている間（収穫〜翌日への一連の演出、鉢選択シーンを含む）は水・肥料ボタンをロックし、翌日になってアイドル状態に戻ってから解放する（Ver0.2）
- [x] 会話は自動で送られる（セリフの長さに応じた時間で次へ進む）。タップすればすぐスキップも可能（Ver0.2）
- [x] DAY1導入会話 →「これ、とっていい？」→（自動収穫）→「わたしがとれた！」→ じしんUP
- [x] localStorageへの自動保存（`wagaya_balcony_save_v1`、状態変化のたびに保存）
- [x] はじめから（確認ダイアログ付きリセット）
- [x] つづきから（保存データが無い場合はボタン無効化）
- [x] スマホ縦画面レイアウト（360〜430px）／PCは480px中央寄せ／ゲーム画面はスマホ横向きにも対応（ステージ＋右カラムの2カラム構成に自動切り替え）
- [x] 背景・キャラクター・植物の別レイヤー表示、鉢は固定スロット方式（slot01〜10 まで拡張可能な座標定義済み、MVPではslot01のみ使用）
- [x] 画像未配置時はCSSだけのプレースホルダー表示（壊れた画像アイコンを出さない。Ver0.2で絵文字表示は廃止）
- [x] 植物図鑑ページ（about.html / plants.html）
- [x] 「本物の鉢を見てみる」リンク（productUrlはプレースホルダー）
- [x] エラー時にゲーム全体が停止しないようにtry/catch・読み込み失敗表示を実装
- [x] 壊れた/不正なlocalStorageデータへの耐性（形式チェック→新規ゲームにフォールバック）
- [x] じしんが称号のしきい値を超えた瞬間のお祝いセリフ＋バーが光る演出（Ver0.2）
- [x] DAY6・DAY10の節目イベント＋DAY7以降はランダムな汎用会話プールで会話が尽きない（Ver0.2）
- [x] 元気が少ない状態で新しい日を迎えると、父からやさしく声をかける一言（罰ではなく誘導）＋植物の彩度をわずかに下げる控えめな表現（Ver0.2）
- [x] じしんが一定のしきい値（`balance.json`の`potUnlockThresholds`）を超えると「新しい鉢を迎えるシーン」に移行し、未所持の植物から選んで鉢を追加できる（Ver0.2）
- [x] コマンドを「水をあげる」「肥料をあげる」の2つに簡略化し、収穫は自動化（Ver0.2）
- [x] 収穫のあと一定確率（`balance.json`の`nutritionSceneChance`、既定35%）で、収穫した植物の栄養素をひとことで紹介する会話シーンが挟まる（Ver0.2）
- [x] 栄養解説は「母」が担当。父・娘に加えて母のキャラクターをベランダ舞台の奥に追加（Ver0.2）
- [x] 全7種類の植物をコンプリートすると「栽培のコツ」ページ（tips.html）が解放される。それまでは収穫済みかどうかのチェックリスト表示のみ（Ver0.2）
- [x] JSONデータ（plants/events/balance）の取得を`cache:"no-cache"`にし、更新後もブラウザキャッシュで古い内容が残らないよう修正（Ver0.2）
- [x] タイトル画面のヒーロー画像、ベランダ背景、父娘の立ち絵、肥料ボタンの画像を実素材に差し替え。肥料ボタンは画像の縦横比に合わせた専用サイズで表示（Ver0.2）
- [x] 水やりボタンも画像化し、肥料ボタンと同じ仕組みで縦横比に合わせた専用サイズに（Ver0.2）
- [x] 植物7種すべてを実画像に差し替え（Ver0.2）
- [x] 「翌日へ」ボタンを廃止。水・肥料ボタンだけが日を進める唯一の手段に（Ver0.2）
- [x] 栄養解説シーン・食事シーンで、専用のイラスト背景に切り替わる仕組みを追加。切り替え中は通常のキャラ・鉢を隠し、シーンのイラストだけを表示する（Ver0.2）
- [x] 各ターンの最後（翌日へ進むタイミング）に、その日の野菜を使った食事シーンを必ず1つ挟むように（Ver0.2）
- [x] 水・肥料ボタンは、会話が流れている間（収穫〜翌日への一連の演出、鉢選択シーンを含む）ロックされ、アイドル状態に戻ってから解放される（Ver0.2）
- [x] キャラクター・鉢の表示をひとまわり大きくし、重なり順は要素ごとにランダム（キャラが手前になることも、鉢が手前になることもある）に変更（Ver0.2）
- [x] 全シーンから絵文字を撤廃。画像が読み込めない場合の代替表示も、絵文字を使わないCSSだけのプレースホルダー（グラデーションの箱）に統一（Ver0.2）
- [x] 鉢は常にキャラクターより手前に表示されるよう調整（キャラクター同士の重なり順のみランダム）（Ver0.2）
- [x] 鉢選択オーバーレイのz-indexを鉢より確実に高くし、ベランダの鉢が選択ウインドウの上に表示されてしまう不具合を修正（Ver0.2）
- [x] 父娘のイラスト（char-family）の位置を少し上寄りに調整（Ver0.2）
- [x] 元気の状態を示す色の点（バッジ）を削除。「元気が少ない状態」は引き続き植物の彩度をわずかに落とす表現だけで伝える（Ver0.2）
- [x] CSS（common.css/game.css）に`?v=`のバージョンクエリを付与し、更新後もブラウザキャッシュで古いスタイルが残らないよう修正（Ver0.2）

## 未実装機能（Ver 0.2以降に持ち越し）

- お世話をしないまま長期間放置した場合の追加演出
- サウンド・BGM
- 日本語以外の言語対応
- 図鑑ページのビジュアル強化

## 開発時の注意：CSS更新時はバージョンクエリを上げる

`css/common.css` や `css/game.css` を変更したときは、各HTMLの `<link>` タグの
`?v=2` の数字を1つ上げてください（例：`?v=3`）。JSONデータ（`data/*.json`）は
`fetch` 側で `cache: "no-cache"` を指定済みで自動的に最新化されますが、CSSは
`<link>` タグ経由のため、ブラウザキャッシュにより更新が反映されないことがあります。

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
| タイトル画面のヒーロー画像 | `assets/backgrounds/opening.jpg` | `js/config.js` の `OPENING_IMAGE`（`index.html`が直接参照） |
| ベランダ背景 | `assets/backgrounds/balcony.jpg` | `js/config.js` の `BACKGROUND_ASSET` |
| 父と娘の立ち絵（1枚にまとめた画像） | `assets/characters/family_cultivating.webp` | `js/config.js` の `CHARACTER_ASSETS.family` |
| 母の立ち絵 | `assets/characters/mother.webp` | `js/config.js` の `CHARACTER_ASSETS.mother` |
| 肥料ボタンの画像 | `assets/ui/hiryou.webp` | `js/config.js` の `FERTILIZER_BUTTON_IMAGE` |
| 水やりボタンの画像 | `assets/ui/mizuyari.webp` | `js/config.js` の `WATER_BUTTON_IMAGE` |
| 栄養解説シーンの背景 | `assets/backgrounds/kaisetu.jpg` | `js/config.js` の `SCENE_BACKGROUNDS.nutrition` |
| 食事シーンの背景 | `assets/backgrounds/syokuji.jpg` | `js/config.js` の `SCENE_BACKGROUNDS.meal` |
| 水菜の画像（透過） | `assets/plants/mizuna.webp` | `data/plants.json` の `mizuna.image` |
| ほうれん草の画像（透過） | `assets/plants/hourensou.webp` | `data/plants.json` の `hourensou.image` |
| いちごの画像（透過） | `assets/plants/ichigo.webp` | `data/plants.json` の `ichigo.image` |
| 茎ブロッコリーの画像（透過） | `assets/plants/kukibrokkori.webp` | `data/plants.json` の `kukibrokkori.image` |
| アイスプラントの画像（透過） | `assets/plants/iceplant.webp` | `data/plants.json` の `iceplant.image` |
| バジルの画像（透過） | `assets/plants/basil.webp` | `data/plants.json` の `basil.image` |
| パセリの画像（透過） | `assets/plants/parsley.webp` | `data/plants.json` の `parsley.image` |

画像が無い間はCSSだけの控えめなプレースホルダー（淡いグラデーションの箱）が表示されるため、ファイルを未配置のまま公開しても壊れたアイコンは表示されません。

## 鉢の追加（じしん連動の解放）の仕組み

- 植物ラインナップは全7種：水菜／ほうれん草／いちご／茎ブロッコリー／アイスプラント／バジル／パセリ。
- `data/plants.json` の各植物には `starter: true/false` があり、`true` の植物（水菜）だけが1日目から所持済み。残り6種が選択候補。
- `data/balance.json` の `potUnlockThresholds`（既定 `[20, 35, 50, 65, 80, 95]`）は、じしんがこの値を超えるたびに「まだ持っていない植物」を選ぶシーンへ移行する、という設定。6種の候補に対応して6段階のしきい値を用意している。
- 新しい植物を追加したいときは、`plants.json` に `starter: false` のエントリを増やし、`assets/plants/`に画像を置くだけでよい（スロットへの配置は自動）。あわせて `nutritionFacts`（後述）も用意すると栄養解説シーンの対象になる。
- 会話文言は `data/events.json` の `potUnlockAnnounce`（解放告知）・`newPotWelcome`（お迎え時、`{name}`は植物名に置換される）で調整可能。

## 収穫後の栄養解説シーンの仕組み

- 収穫のたびに `balance.json` の `nutritionSceneChance`（既定0.35＝35%）の確率で、収穫した植物のうち1つについて栄養素を紹介する短い会話が挟まる。
- 植物ごとの豆知識は `data/plants.json` の各植物の `nutritionFacts` に配列で持たせてあり、複数用意しておくとランダムに選ばれてバリエーションが出る。
- 前後を挟む「ねえ、これってどんな栄養があるの？」「へえ、知らなかった！」のような定型セリフは `data/events.json` の `nutritionIntro` / `nutritionOutro` から選ばれる（こちらもランダム）。
- 新しい植物を追加する際は `nutritionFacts` に `[{ "speaker": "mother", "text": "…" }]` の形式で1つ以上追加すればよい（未設定の場合はそのシーンは出ない）。栄養解説は母のセリフという設定なので `speaker` は `mother` を使う。

## 専用背景に切り替わる会話シーン（栄養解説・食事）の仕組み

- 会話データの各セリフは `{ speaker, text }` の他に、任意で `scene` を持てる（`js/game.js` の `withScene()` が付与）。
- `js/ui.js` はセリフを1行表示するたびに `scene` を見て、`js/config.js` の `SCENE_BACKGROUNDS`（`nutrition` → `kaisetu.jpg`、`meal` → `syokuji.jpg`）に従って背景画像を切り替える。`scene` が無い（通常の）セリフでは、いつものベランダ背景に戻る。
- `scene` 中はステージに `scene-cutscene` クラスが付き、`css/game.css` の定義により通常のキャラクター（父娘・母）と鉢は非表示になる（イラスト側にすでにキャラクターが描かれているため）。
- 食事シーンは `nextDay()`（＝日をまたぐたび）の最後に必ず1つ挟まる。会話文言は `data/events.json` の `mealScene` から配列単位でランダムに選ばれる。
- 新しいシーン種別を増やしたい場合は、①`SCENE_BACKGROUNDS`に背景を追加、②該当セリフを`withScene(lines, "新しい名前")`で包む、の2手順でよい。

## 栽培のコツ（tips.html）の仕組み

- `data/plants.json` の各植物が持つ `growingTip`（実際の育て方のコツ、1文）を、全7種類を収穫し終えると `tips.html` で読めるようになる。
- 判定はそのページ単体で行っており（`js/save.js` でセーブデータを読み、所持している植物IDと `plants.json` の全IDを比較）、ゲーム側の状態管理には影響しない。
- コンプリート前は、収穫済みの植物名だけが分かるチェックリスト表示になり、コツ本文（`growingTip`）は表示されない。
- 新しい植物を追加する際は `growingTip` も一緒に用意すること。

## 次に実装すべき Ver 0.3 の内容

1. **実画像への差し替え**：`assets/`配下にWebP画像を配置するだけで見た目が完成する。
2. **収穫物の活用**：`assets/food/`を使い、収穫した野菜が食卓に並ぶような簡易演出を追加。
3. **お世話忘れ時の会話バリエーション**：元気が下がった状態専用のセリフをさらに追加。
4. **EC連携の実装確認**：実際のSTORES/BASEの商品URLに差し替え、動作確認。
5. **鉢が増えた後の演出強化**：ベランダが賑やかになっていく様子を称号やHUDでも表現する。
