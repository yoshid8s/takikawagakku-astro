export type CleanCampaignImage = {
  src: string;
  alt: string;
};

export type CleanCampaignRecord = {
  year: number;
  summary: string;
  date?: string;
  time?: string;
  venue?: string;
  organizer?: string;
  contents?: string;
  participants?: string;
  photos?: CleanCampaignImage[];
  flyers?: CleanCampaignImage[];
};

export const cleanCampaignRecords: CleanCampaignRecord[] = [
  {
    year: 2025,

    summary:
      "梅雨入り直前ではあるもののよく晴れた日に実施。大人56名、子ども28名が2コースに分かれ、楽しく交流をしながら地域を歩きました。東川名山町内会は別コースで大人21名、子ども1名が参加しました。初めてお会いする方とお話ししながら地域の美化を考え、有意義な日になりました。ゴミは少ないと言えど落ちています。街行く人々が、日頃から気をつけ、ポイ捨てしないよう意識していけたらいいですね。ご参加いただきました皆様ありがとうございました。",

    date: "2025年6月7日",

    participants: "計106名",
  },

  {
    year: 2024,

    summary:
      "気持ちよく晴れた土曜日の朝、クリーンキャンペーンを行いました。町内会や消防団、保健環境委員会、高年クラブをはじめ、トワイライトや子ども会のみなさんが参加してくださいました。休日にたくさんご参加いただき、ありがとうございました。",

    participants: "大人77名、子ども36名、合計113名",
  },

  {
    year: 2023,

    summary:
      "秋晴れの気持ちの良い土曜日の朝、約70名が参加してクリーンキャンペーンを行いました。小学校でのイベントと重なっていましたが、クリーンキャンペーンで街を綺麗にしてからイベントに移動してくれる小学生もたくさんいました。今回も、保健環境委員、区政協力委員、消防団、子ども会のみなさんのおかげで町がきれいになりました。参加者のみなさん、ありがとうございました。",

    participants: "約70名",
  },
];
