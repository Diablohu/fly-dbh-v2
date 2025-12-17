import { type VideoItemType, type VideoTagType } from "@/types";
import { level2Tags } from "@/global";
import { EXTREME_AIRPORT } from "@/constants/video-tags";

const getVideoItemTopTags = (
    post: Partial<VideoItemType>,
    purpose:
        | "latest"
        | "search-result"
        | "tutorial"
        | "news"
        | "preview"
        | "review"
        | "world"
        | "chat"
        | "short"
): VideoTagType[] | undefined => {
    switch (purpose) {
        case "latest":
            return post.tags?.[0]
                ? [
                      {
                          type: "tag",
                          _id: post.tags[0]._id,
                          name: post.tags[0].name,
                          slug: post.tags[0].slug,
                      },
                  ]
                : undefined;

        case "search-result":
            return Array.isArray(post.tags) && post.tags.length > 0
                ? post.tags.slice(0, 2).map((tag) => ({
                      type: "tag",
                      _id: tag._id,
                      name: tag.name,
                      slug: tag.slug,
                  }))
                : undefined;

        case "tutorial": {
            const thisTag = post.tags?.filter((tag) =>
                level2Tags["tutorial"].includes(tag.slug || "")
            )[0];
            return thisTag
                ? [
                      {
                          type: "tag",
                          _id: thisTag._id,
                          name: thisTag.name,
                          slug: thisTag.slug,
                      },
                  ]
                : undefined;
        }

        case "news": {
            const level2Tag =
                "news" in level2Tags &&
                post.tags?.filter((tag) =>
                    level2Tags["news"].includes(tag.slug || "")
                )[0];
            if (level2Tag)
                return [
                    {
                        type: "tag",
                        _id: level2Tag._id,
                        name: level2Tag.name,
                        slug: level2Tag.slug,
                    },
                ];
            const thisTag = post.tags?.filter((tag) => tag.slug !== "news")[0];
            return thisTag
                ? [
                      {
                          type: "tag",
                          _id: thisTag._id,
                          name: thisTag.name,
                          slug: thisTag.slug,
                      },
                  ]
                : post.developers?.[0]
                  ? post.developers.slice(0, 2).map((developer) => ({
                        type: "developer",
                        _id: developer._id,
                        name: developer.name,
                        slug: developer.slug,
                    }))
                  : undefined;
        }

        case "preview":
        case "review": {
            return post.developers?.[0]
                ? post.developers.slice(0, 2).map((developer) => ({
                      type: "developer",
                      _id: developer._id,
                      name: developer.name,
                      slug: developer.slug,
                  }))
                : post.games?.[0]
                  ? post.games.slice(0, 2).map((platform) => ({
                        type: "developer",
                        _id: platform._id,
                        name: platform.name,
                        slug: platform.slug,
                    }))
                  : undefined;
        }

        case "world": {
            const thisTag = post.tags?.filter((tag) =>
                [EXTREME_AIRPORT].includes(tag.slug || "")
            )[0];
            return thisTag
                ? [
                      {
                          type: "tag",
                          _id: thisTag._id,
                          name: thisTag.name,
                          slug: thisTag.slug,
                      },
                  ]
                : undefined;
        }

        case "chat":
        case "short": {
            const thisTag = post.tags?.filter((tag) => tag.slug !== purpose)[0];
            return thisTag
                ? [
                      {
                          type: "tag",
                          _id: thisTag._id,
                          name: thisTag.name,
                          slug: thisTag.slug,
                      },
                  ]
                : undefined;
        }

        default:
            return undefined;
    }
};

export default getVideoItemTopTags;
