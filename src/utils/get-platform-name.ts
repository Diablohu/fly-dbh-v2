const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "b":
        case "bili":
        case "bilibili": {
            return "哔哩哔哩";
        }

        case "yt":
        case "ytb":
        case "youtube": {
            return "YouTube";
        }

        case "dy":
        case "douyin": {
            return "抖音";
        }

        case "tk":
        case "tiktok": {
            return "TikTok";
        }

        case "xhs":
        case "xiaohongshu":
        case "rednote": {
            return "小红书";
        }
    }

    return platform;
};

export default getPlatformName;
