export type BousaiFesImage = {
  src: string;
  alt: string;
};

export type BousaiFesRecord = {
  year: number;
  summary: string;
  date?: string;
  time?: string;
  venue?: string;
  organizer?: string;
  contents?: string;
  photos?: BousaiFesImage[];
  flyers?: BousaiFesImage[];
};

export const bousaiFesRecords: BousaiFesRecord[] = [
  {
    year: 2026,

    summary:
      "地域の防災力を高めるため、楽しみながら学べる「滝川防災フェス」を開催しました。消火器体験や避難所設営体験など、さまざまな体験ブースを通して実践的な防災スキルを学ぶことができるイベントです。ブースを回ってスタンプを集めると「防災マスター」に認定されるなど、家族で楽しみながら防災をより身近に感じられる機会となりました。",

    photos: [
      {
        src: "/images/event/bousai-fes/2026/photo-01.jpg",
        alt: "滝川防災フェス2026 当日の様子 1",
      },
      {
        src: "/images/event/bousai-fes/2026/photo-02.jpg",
        alt: "滝川防災フェス2026 当日の様子 2",
      },
      {
        src: "/images/event/bousai-fes/2026/photo-03.jpg",
        alt: "滝川防災フェス2026 当日の様子 3",
      },
      {
        src: "/images/event/bousai-fes/2026/photo-04.jpg",
        alt: "滝川防災フェス2026 当日の様子 4",
      },
    ],

    flyers: [
      {
        src: "/images/event/bousai-fes/2026/flyer.png",
        alt: "滝川防災フェス2026 チラシ",
      },
    ],
  },
];
