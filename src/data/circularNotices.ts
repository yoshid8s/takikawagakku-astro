export type CircularItem = {
  label: string;
  href?: string;
  details?: string[];
};

export type CircularNotice = {
  title: string;
  items: CircularItem[];
};

export const copiesPdf =
  "https://takikawagakku.jp/wp/wp-content/uploads/2026/08/20260731-%E5%9B%9E%E8%A6%A7%E3%83%BB%E9%85%8D%E5%B8%83%E8%B3%87%E6%96%99-%E5%BF%85%E8%A6%81%E9%83%A8%E6%95%B0%E4%B8%80%E8%A6%A7.pdf";

export const circularNotices: CircularNotice[] = [
  {
    title: "2026年8月回覧板（２回目）",
    items: [
      {
        label:
          "2026年度八事日赤健康教室 8月25日（火）14:00-15:00 日赤愛知医療センター名古屋第二病院第三病棟１階研修ホール 「食物アレルギーは予防できる？～最新の知識でこどもの未来を変える～」",
        // 現行ページのリンクをそのまま設定
        href: "https://www.nagoya2.jrc.or.jp/event/post/%e7%ac%ac1%e5%9b%9e-2026%e5%b9%b4%e5%ba%a6%e5%85%ab%e4%ba%8b%e6%97%a5%e8%b5%a4%e5%81%a5%e5%ba%b7%e6%95%99%e5%ae%a4%e3%80%8c%e9%a3%9f%e7%89%a9%e3%82%a2%e3%83%ac%e3%83%ab%e3%82%ae%e3%83%bc%e3%81%af-2/",
      },
      {
        label:
          "2026年度八事日赤健康教室 9月10日（木）14:00-15:00 日赤愛知医療センター名古屋第二病院第三病棟１階研修ホール 「知って安心、見つけて守る！胃腸がんと内視鏡の話」",
        href: "https://www.nagoya2.jrc.or.jp/event/post/%E7%AC%AC2%E5%9B%9E-2026%E5%B9%B4%E5%BA%A6%E5%85%AB%E4%BA%8B%E6%97%A5%E8%B5%A4%E5%81%A5%E5%BA%B7%E6%95%99%E5%AE%A4%E3%80%8C%E7%9F%A5%E3%81%A3%E3%81%A6%E5%AE%89%E5%BF%83%E3%80%81%E8%A6%8B%E3%81%A4-2/",
      },
    ],
  },

  {
    title: "2026年8月回覧板",
    items: [
      {
        label: "災害時の「携帯トイレ」の重要性と使い方について",
        href: "https://www.city.nagoya.jp/atsuta/kurashi/1022124/1036044.html",
      },
      {
        label: "ペットと飼い主の防災・減災チェックリスト",
        href: "https://www.aichi-gyosei.or.jp/wp-content/uploads/2025/07/1752545336-221682_3.pdf",
      },
      {
        label: "家具固定ボランティアのごあんない",
        href: "https://www.showaku-shakyo.jp/news/%E5%AE%B6%E5%85%B7%E5%9B%BA%E5%AE%9A%E3%81%AE%E3%81%94%E3%81%82%E3%82%93%E3%81%AA%E3%81%84/",
      },
      {
        label:
          "鳥刺し、しもふりなど生又は加熱不十分な鶏肉料理によるカンピロバクター食中毒に注意！",
        href: "https://www.city.nagoya.jp/kenkofukushi/eisei/1014927/1014928/1014929/1014945.html",
      },
      {
        label: "「なごや健康マイレージ」の紹介",
        href: "https://www.city.nagoya.jp/kenkofukushi/kenkoinfo/1009410/1009435.html",
      },
    ],
  },
  {
    title: "2026年7月回覧板（２回目）",
    items: [
      {
        label: "こども大学 8/23 「夕日はなぜ赤い？」",
        href: "/event/child_club-child_univ",
      },
      {
        label: "令和8年度「昭和区民美術展」への出品作品を募集",
        href: "https://www.city.nagoya.jp/showa/oshirase/1021396/1051161.html",
      },
      {
        label: "令和8年度なごや市民総ぐるみ防災訓練の実施について",
        href: "https://www.city.nagoya.jp/bousaiportal/kyoujo/1036451/1050307.html",
      },
      {
        label:
          "伝統芸能「能」を体験しよう！「夏休み　お能無料体験」8/25（火）14:00-15:30",
        href: "/event/free_noh_trial_session",
      },
      {
        label: "来たれ！滝川学区のおやじたち「おやじ塾」7/19 、8/8",
        href: "/event/oyaji_jyuku",
      },
      {
        label: "朝食サロン 7/26 、8/30",
        href: "/event/breakfast_salon",
      },
      {
        label: "名古屋市「重層的支援体制整備事業」について",
        href: "https://nagoya-shakyo.jp/service/jusotekishien",
      },
      {
        label: "聖霊病院「聖風」2026.6月号",
        href: "https://www.showaku-shakyo.jp/corporate/support-member",
      },
      {
        label: "令和8年度なごや市民総ぐるみ防災訓練の実施について",
        href: "https://www.city.nagoya.jp/bousaiportal/kyoujo/1036451/1050307.html",
      },
    ],
  },

  {
    title: "2026年7月回覧板",
    items: [
      {
        label: "滝川学区だより",
        href: "/about/takikawagakku_newsletter/",
      },
      {
        label: "家庭用ごみ・資源の指定袋に関する臨時措置の延長について",
        href: "https://www.city.nagoya.jp/kurashi/gomi/1012183/1012257/1049920.html",
      },
      {
        label: "熱中症予防のために",
        href: "https://www.mhlw.go.jp/seisakunitsuite/bunya/kenkou_iryou/kenkou/nettyuu/nettyuu_taisaku/",
      },
      {
        label: "令和8年度昭和区区政運営方針",
        href: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/021/337/r8houshin.pdf",
      },
      {
        label:
          "令和8年度感染症対策講座「感染症に負けない身体づくり」令和8年7月10日　昭和文化小劇場",
        href: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/048/638/r8_6_kansensyo.pdf",
      },
      {
        label: "令和8年8月2日（日曜日）開催　昭和区eスポーツフェスティバル",
        href: "https://www.city.nagoya.jp/showa/oshirase/1021396/1050946.html",
      },
    ],
  },
  {
    title: "2026年6月回覧板",
    items: [
      {
        label: "昭和区川名公園工事のお知らせ",
        href: "",
        details: [
          "工事期間　令和8年5月下旬から8月下旬まで",
          "工事期間中は公園の一部が使えないことや、園路の一部を封鎖することがあります。",
        ],
      },
      {
        label: "令和8年度感染症対策講座「感染症に負けない身体づくり」",
        href: "hhttps://www.city.nagoya.jp/showa/kenko/1021406/1049730.html",
        details: ["令和8年7月10日（金）13:30〜15:30 会場：昭和文化小劇場"],
      },
      {
        label:
          "親と子の災害体験教室「夏休みに家族で防災について学びませんか？」",
        href: "https://www.city.nagoya.jp/bousai/shoubou/1012732/1012733/1012913/1012914/1048891.html",
        details: [
          "8月9日（日） 9:30〜12:00 場所：昭和消防署",
          "募集期間：6月15日（月）〜7月12日（日）",
        ],
      },
      {
        label: "家具固定サポートの案内　家具３点まで無料",
        href: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/012/929/kaguketei.pdf",
      },
      {
        label: "八事交番だより6月号",
        href: "https://www.pref.aichi.jp/police/syokai/sho/shouwa/images/R806yagoto.pdf",
      },
    ],
  },
  {
    title: "2026年5月回覧板（２回目）",
    items: [
      {
        label: "令和8年度　蚊の防除運動への協力依頼（千種保健センター）",
        href: "",
        details: [
          "実施期間令和8年6月1日〜7月31日",
          "町内掲示板でのポスター掲示",
        ],
      },
      {
        label: "令和8年度草木類収集について",
        href: "https://www.city.nagoya.jp/kurashi/gomi/1012183/1033464.html",
        details: [
          "昭和区収集日は、6月21日（日）、10月18日（日）、11月22日（日）の年３回",
          "各収集日の6日前（月曜日）までにインターネットで申し込み（上記リンク先）",
        ],
      },
      {
        label: "粗大ゴミの処理手数料改定および定義変更について",
        href: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/048/723/gomisyori_kai.pdf",
        details: ["2,000円、2,500円区分の新設"],
      },
      {
        label: "浸水発生時の対応について",
        href: "https://www.city.nagoya.jp/kenkofukushi/eisei/1014926/1015240/1015265.html",
        details: ["防疫活動の一環として希望する被災住宅に消毒薬を配布"],
      },
      {
        label:
          "フレイル予防および健康増進を目的とした モーショントレーニングシステム「TANO」設置 について",
        href: "https://www.city.nagoya.jp/showa/kenko/1021411/1042812.html",
        details: [
          "昭和福祉会館１階に「TANO」が設置され、60歳以上の方が利用可能",
        ],
      },
      {
        label: "歯と口の1日健康センター（予約制）",
        href: "https://www.city.nagoya.jp/showa/kosodate/1021435/1047156.html",
        details: [
          "開催日：6月11日（木）午後1時30分〜3時30分",
          "場　所：昭和保健センター",
          "対　象：0歳〜小学生とその保護者",
        ],
      },
    ],
  },
  {
    title: "2026年5月回覧板",
    items: [
      {
        label: "令和8年度ゴキブリ防除運動の案内",
        href: "",
        details: [
          "講習会案内　5月27日（水）午後２〜３時　昭和区保健センター５階健康増進室　定員15名",
          "申込　5月11日（月）午前9時から受付開始",
          "窓口　千種区保健センター環境薬務課　住居衛生・薬務担当　052-753-1973",
        ],
      },
      {
        label: "緑のカーテンづくり講習会（千種区・昭和区合同）",
        href: "",
        details: ["日時　令和8年5月28日（木）午後２〜３時"],
      },
      {
        label: "ショウちゃんクッキーのご紹介",
        href: "https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/021/499/80430omote.pdf",
        details: [
          "江戸時代から昭和初期にかけて、御器所（ごきそ）周辺では青首大根の生産が盛んであり、その大根は産地名から「御器所大根」と呼ばれており、それにちなんだ昭和区のキャラクターが「ショウちゃん」です。",
        ],
      },
      {
        label: "使用済み食用油のSAF化",
        href: "https://www.city.nagoya.jp/houdou/_res/projects/project_houdou/_page_/003/004/234/syokuyouaburaposter.pdf",
        details: [
          "使い終わった食用油を新たな資源化用途として注目を集めるSAF（持続可能な航空燃料）として国内で資源化する取り組みについて",
        ],
      },
    ],
  },
  {
    title: "2026年4月回覧板",
    items: [
      {
        label: "赤十字活動資金への協力のお願い",
        href: "https://www.jrc.or.jp/chapter/aichi/contribute",
      },
      {
        label: "令和8年度前期　昭和生涯学習センター講座・事業のご案内",
        href: "https://www.showa-llc.jp/assets/eee34200dba1e0367a1f5f10ccb051bac61cdd55.pdf",
      },
      {
        label:
          "2026やごと日赤ふれあいひろば開催の案内　2026.5.16土 10:00-15:00",
      },
      {
        label: "昭和区ホームファイヤーモニターズクラブ会員募集の案内",
        href: "/crisis_management/crisis_management-home_fire_monitors_club",
      },
      {
        label:
          "NPO法人なごやAsoviva✖️滝川学区自治協議会 コミセン方フリースクール「ゆるびば」紹介",
        href: "/takikawa_community_icenter/%e3%83%95%e3%83%aa%e3%83%bc%e3%82%b9%e3%82%af%e3%83%bc%e3%83%ab%e3%80%8c%e3%82%86%e3%82%8b%e3%81%b3%e3%81%b0%e3%80%8d-2",
      },
      {
        label: "八事の森の春まつり2026 開催のお知らせ",
        href: "https://www.city.nagoya.jp/showa/oshirase/1021396/1045850.html",
      },
      {
        label: "第67回名大祭のご案内",
        href: "https://meidaisai.com/67th",
      },
      {
        label: "聖霊病院広報誌「聖風」2026.3月号",
        href: "https://www.seirei-hospital.org/wp-content/uploads/2026/04/seifu_25.pdf",
      },
      {
        label: "八事交番だより4月号",
        href: "https://www.pref.aichi.jp/police/syokai/sho/shouwa/images/R0804yagoto.pdf",
      },
    ],
  },
];
