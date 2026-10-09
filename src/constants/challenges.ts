import { type ChallengeListCatalogType } from "@/types";

export const heroImage: Record<ChallengeListCatalogType, string> = {
    latest: "dc8c90a5e20183a9e3713e460593908e325a0170-2560x1440.png",
    filter: "72652ccf561caabf581c6ca18450ab69ad1823ef-2560x1440.jpg",
    wip: "3f7ee853ae4865f894adc85474422039e6062413-2560x1440.png",

    bush: "e955577ad3939d29c3ffbc33a002cb99111bdd22-2560x1440.png",
    "luxury-private": "6098c0f600461bc27680128b8c321b169f3a6b8e-2560x1440.png",
    "small-commercial":
        "f1394f67799f573b24375aa9faf9fdff4ee7b0b8-2560x1440.png",
    "medium-commercial":
        "e985098d1b6c19b9704eb87dff9ebe5dcd409b4b-2560x1440.png",
    "business-jets": "8a5b4efc96e0447566140d00c5bcace603d53848-2560x1440.png",
    "large-narrow-body":
        "5d0f7d320d719d59ad974b8a5ba89b5b02efa464-2560x1440.png",
    "large-wide-body": "2d9a4f49126a181e19899072cf88c18b964fd9ba-2560x1440.png",
};
export const exampleAircrafts: Record<ChallengeListCatalogType, string[]> = {
    latest: [],
    filter: [],
    wip: [],

    bush: ["DHC-6“双水獭”", "塞斯纳 208"],
    "luxury-private": ["钻石 DA-42", "西瑞 VisionJet"],
    "small-commercial": ["皮拉图斯 PC-12", "索卡达 TBM"],
    "medium-commercial": ["ATR", "冲8"],
    "business-jets": ["塞斯纳奖状", "庞巴迪挑战者"],
    "large-narrow-body": ["空客 A320", "波音 737"],
    "large-wide-body": ["空客 A350", "波音 777"],
};
