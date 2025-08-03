export type Channel = {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
  enabled: boolean;
};

export const channels: Channel[] = [
  { id: '1', name: 'Marques Brownlee', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man tech', enabled: true },
  { id: '2', name: 'MrBeast', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man fun', enabled: true },
  { id: '3', name: 'Lex Fridman', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man podcast', enabled: false },
  { id: '4', name: 'Fireship', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'code fire', enabled: true },
  { id: '5', name: 'Veritasium', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'science man', enabled: true },
  { id: '6', name: 'SmarterEveryDay', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'man rocket', enabled: false },
  { id: '7', name: 'Kurzgesagt', avatarUrl: 'https://placehold.co/40x40.png', avatarHint: 'animation bird', enabled: true },
];

export type Summary = {
  id: string;
  videoTitle: string;
  channelName: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  summaryPoints: string[];
  publishedAt: string;
  channelAvatarUrl: string;
  channelAvatarHint: string;
};

export const summaries: Summary[] = [
  {
    id: '1',
    videoTitle: 'The M4 iPad Pro Review: The iPad is Back!',
    channelName: 'Marques Brownlee',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    thumbnailHint: 'tech tablet',
    channelAvatarUrl: 'https://placehold.co/40x40.png',
    channelAvatarHint: 'man tech',
    summaryPoints: [
      "The M4 iPad Pro is incredibly thin and light, making it the most portable pro-level tablet Apple has made.",
      "The new 'Tandem OLED' display is a significant upgrade, offering true blacks, higher brightness, and better contrast.",
      "The M4 chip provides a substantial performance boost, though most users may not notice it in everyday tasks yet.",
      "Apple Pencil Pro adds new gestures like squeeze and barrel roll, enhancing the creative workflow.",
      "Despite hardware improvements, iPadOS remains the biggest limiting factor for the iPad to be a true laptop replacement.",
    ],
    publishedAt: '2 days ago',
  },
  {
    id: '2',
    videoTitle: 'I Built a Real-Life Chocolate Factory!',
    channelName: 'MrBeast',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    thumbnailHint: 'candy factory',
    channelAvatarUrl: 'https://placehold.co/40x40.png',
    channelAvatarHint: 'man fun',
    summaryPoints: [
      "The video features a recreation of Willy Wonka's chocolate factory, complete with a chocolate river and edible garden.",
      "Ten contestants compete in a series of challenges to win the factory.",
      "Challenges included finding a golden ticket, a candy-making contest, and a final test of honesty.",
      "Gordon Ramsay makes a guest appearance to judge one of the food-based challenges.",
      "The winner receives the keys to the custom-built factory, showcasing another massive-scale production from MrBeast.",
    ],
    publishedAt: '5 days ago',
  },
    {
    id: '3',
    videoTitle: 'What is The Future of AI? (special episode)',
    channelName: 'Fireship',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    thumbnailHint: 'robot code',
    channelAvatarUrl: 'https://placehold.co/40x40.png',
    channelAvatarHint: 'code fire',
    summaryPoints: [
      "Large Language Models (LLMs) are evolving at an exponential rate, with new capabilities emerging constantly.",
      "The video discusses the potential for AI to automate coding, content creation, and other knowledge-based work.",
      "It explores the debate between open-source AI models and closed-source, proprietary systems from companies like OpenAI and Google.",
      "Ethical considerations, including bias, job displacement, and misuse, are critical challenges for the AI community.",
      "The future might see smaller, specialized AI models running locally on devices, rather than relying solely on massive cloud-based models.",
    ],
    publishedAt: '1 week ago',
  },
    {
    id: '4',
    videoTitle: 'The Bizarre Behavior of Rotating Bodies',
    channelName: 'Veritasium',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    thumbnailHint: 'science space',
    channelAvatarUrl: 'https://placehold.co/40x40.png',
    channelAvatarHint: 'science man',
    summaryPoints: [
      "The video explores the Dzhanibekov effect, where a spinning object in zero gravity periodically flips its axis of rotation.",
      "This counterintuitive behavior is explained by the intermediate axis theorem, which states that rotation around an object's axis with intermediate moment of inertia is unstable.",
      "The effect is demonstrated with various objects, including a T-handle wrench spun by cosmonauts on the Salyut 7 space station.",
      "The physics involves conservation of angular momentum and energy, showing that the flip is an energy-efficient state transition.",
      "This principle applies to various scales, from satellites in orbit to molecules.",
    ],
    publishedAt: '2 weeks ago',
  }
];
