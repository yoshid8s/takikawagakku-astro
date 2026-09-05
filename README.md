# 滝川学区自治協議会 Webサイト

滝川学区自治協議会公式Webサイト  
https://takikawagakku.jp/

WordPress / Colibri で構築されていた既存サイトを、表示速度・保守性・更新性の向上を目的として Astro へ移行したプロジェクトです。

WordPressは完全には廃止せず、予約システムなどWordPressを必要とする機能のバックエンドとして `/wp/` に残す構成としています。

---

## 技術構成

- Astro
- Tailwind CSS
- Node.js
- pnpm
- ExcelJS
- GitHub
- GitHub Actions
- さくらのレンタルサーバ
- WordPress（予約システム等のバックエンドとして継続利用）

Astro側は基本的に静的HTMLとしてビルドします。

---

## サイト構成

主なページ：

```text
/
├── about/
├── event/
├── child_club/
├── community/
├── crisis_management/
├── takikawa_community_icenter/
├── blog/
├── category/
├── YYYY/MM/
└── 各記事ページ
```

WordPressから移行した記事は Astro Content Collections を利用して管理しています。

```text
src/content/blog/
```

記事一覧・カテゴリー・年月別アーカイブ・記事詳細ページは、Astro側で生成します。

---

## プロジェクト構成

主なディレクトリ：

```text
/
├── data/
│   └── community-center/
│       └── raw/
│           └── コミセン利用台帳Excel
│
├── public/
│   ├── images/
│   └── favicon.ico
│
├── scripts/
│   ├── generate-community-calendar.mjs
│   └── lib/
│       └── community-calendar-svg.mjs
│
├── src/
│   ├── components/
│   ├── content/
│   │   └── blog/
│   ├── data/
│   │   └── community-calendar.json
│   ├── layouts/
│   └── pages/
│
├── deployment/
├── astro.config.mjs
├── package.json
└── pnpm-lock.yaml
```

---

# 開発環境

## 必要環境

Node.js：

```text
>= 22.12.0
```

パッケージマネージャー：

```text
pnpm
```

---

## インストール

```bash
pnpm install
```

---

## ローカル開発

```bash
pnpm dev
```

Astroの開発サーバーが起動します。

通常は、

```text
http://localhost:4321/
```

で確認できます。

4321番ポートが使用中の場合は、Astroが別のポートを使用します。

---

## 本番ビルド

```bash
pnpm build
```

生成物：

```text
dist/
```

---

# 滝川コミセン予定表の自動生成

`/takikawa_community_icenter/` では、コミュニティセンターのExcel利用台帳を元データとして、

1. 滝川コミセンの主な予定
2. 滝川コミセンの空室状況

の両方を自動生成します。

---

## Excelファイル

元データは、

```text
data/community-center/raw/
```

へ配置します。

例：

```text
竹内9.xlsx
竹内10.xlsx
竹内11.xlsx
竹内12.xlsx
```

ファイル名から年月を判断するのではなく、ExcelのA1に記載されている、

```text
2026年9月　利用台帳　　受付開始日　7月1日
```

のような年月を読み取ります。

---

## 主な予定の生成

実行スクリプト：

```text
scripts/generate-community-calendar.mjs
```

Excelから対象イベントを抽出し、

```text
src/data/community-calendar.json
```

を生成します。

現在の抽出対象：

```text
囲碁クラブ
子ども将棋講座
自治協議会理事会
ワインクラブ
子ども大学
朝食サロン
```

Excel上の名称とWeb表示名称が異なるものについては、スクリプト内で対応付けています。

誤検出防止のため、イベント名は完全一致で判定します。

同じイベントが複数の部屋・時間帯に登録されている場合は、同一日について重複を除外します。

---

## 空室状況SVGの生成

SVG生成処理：

```text
scripts/lib/community-calendar-svg.mjs
```

Excelの表示情報を読み取り、月別のSVGを直接生成します。

生成先：

```text
public/images/community-center/availability/
```

例：

```text
202609.svg
202610.svg
202611.svg
202612.svg
```

SVGにはExcelの以下の情報を反映します。

- セルの値
- 結合セル
- 列幅
- 行高
- 背景色
- 罫線
- フォントサイズ
- 太字
- 文字色
- 水平・垂直配置

SVGには白背景も自動生成します。

これにより従来行っていた、

```text
Excel
 ↓
PDF書き出し
 ↓
Illustratorで編集
 ↓
白背景等を調整
 ↓
SVG書き出し
 ↓
Webサイトへ配置
```

という作業は不要になりました。

現在は、

```text
Excel
 ↓
Astro自動生成
 ├── 主な予定 JSON
 └── 空室状況 SVG
```

という運用になっています。

---

## 手動生成

必要な場合は、

```bash
pnpm calendar:generate
```

を実行します。

---

## dev / build 時の自動生成

`package.json` では、

```text
predev   → calendar:generate
prebuild → calendar:generate
```

を設定しています。

そのため通常は、

```bash
pnpm dev
```

または、

```bash
pnpm build
```

を実行するだけで、最新ExcelからJSONとSVGが自動生成されます。

---

# コミセン予定更新フロー

通常の更新作業：

1. コミュニティセンターのExcel利用台帳を更新
2. `data/community-center/raw/` のExcelを更新
3. `pnpm dev`
4. `/takikawa_community_icenter/` で表示確認
5. Git commit / push
6. Preview環境で最終確認

PDFやIllustratorによる空室状況SVGの制作は不要です。

---

# WordPressとの共存

WordPressは以下に残します。

```text
/wp/
```

主に、Astroへ移行しない予約システム等の機能を継続して利用するためです。

そのため、本番デプロイ時に `/wp/` を削除してはいけません。

特に `rsync --delete` 等を利用する場合は、WordPressディレクトリを削除しないよう注意してください。

---

## WordPress側に残すページ

予約システムと密接に連携している以下のページについては、WordPress側で継続運用します。

- 利用規約
- プライバシーポリシー
- 特定商取引法に基づく表記
- 予約システム関連ページ

---

# Preview環境

Preview：

```text
https://preview.takikawagakku.jp/
```

さくらのレンタルサーバ上の、

```text
/home/takikawagakku/www/preview/
```

へデプロイします。

Preview環境にはBasic認証を設定しています。

また、検索エンジンへ登録されないよう、

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

および `robots.txt` によるクロール拒否を設定しています。

---

# GitHub Actions

`main` ブランチへのpush後、GitHub Actionsでビルド・Previewデプロイを行います。

Previewへのデプロイに必要な接続情報はGitHub Secretsで管理しています。

主なSecrets：

```text
SAKURA_HOST
SAKURA_PASSWORD
SAKURA_PREVIEW_DEPLOY_PATH
SAKURA_SSH_PORT
SAKURA_USERNAME
```

パスワード等をREADMEやソースコードへ直接記載しないでください。

---

# 本番公開時の注意

本番サーバ：

```text
/home/takikawagakku/www/
```

WordPress：

```text
/home/takikawagakku/www/wp/
```

Astroを本番ルートへ配置する際も、`/wp/` は維持します。

本番切り替え時は、

1. 現行WordPressサイトをバックアップ
2. Astroをビルド
3. Astro生成物をWebルートへ配置
4. `/wp/` を維持
5. `.htaccess` をAstro構成に合わせて調整
6. WordPress管理画面を確認
7. 予約システムを確認
8. Astro各ページを確認
9. リダイレクトを確認

の順で実施します。

---

# 公開データについて

`data/community-center/raw/` のExcelはGit管理対象です。

Publicリポジトリで運用する場合、GitへcommitしたExcelも公開情報となります。

そのため、Excelをcommitする前に、

- 氏名
- 電話番号
- メールアドレス
- その他Web公開すべきでない情報

が含まれていないことを確認してください。

---

# 開発・運用方針

このプロジェクトでは、

- WordPressからAstroへの段階的移行
- 既存サイトの情報・機能を維持
- 静的HTMLによる高速表示
- 更新作業の自動化
- WordPress依存部分のみバックエンドとして維持
- Preview環境で確認してから公開

を基本方針としています。

特に、日常的に更新する情報については、
可能な限り既存業務の元データから自動生成し、
Webサイトのためだけの二重入力を減らすことを重視しています。

---

# 現在の状況

- [x] Astroプロジェクト構築
- [x] Tailwind CSS導入
- [x] WordPress主要ページ移行
- [x] WordPress投稿記事移行
- [x] 記事詳細ページ
- [x] カテゴリーアーカイブ
- [x] 年月別アーカイブ
- [x] レスポンシブ対応
- [x] モバイル表示調整
- [x] 画像Lightbox対応
- [x] 滝川コミセンページ移行
- [x] コミセン「主な予定」Excel自動生成
- [x] コミセン「空室状況」SVG自動生成
- [x] Excel → JSON / SVG 一括生成
- [x] Preview環境構築
- [x] Preview Basic認証
- [x] Preview noindex
- [x] GitHub ActionsによるPreview自動デプロイ
- [ ] 自治協議会確認
- [ ] 本番切り替え
- [ ] 本番公開後の動作確認

---

## Repository

GitHub repository:

```text
yoshid8s/takikawagakku-astro
```
