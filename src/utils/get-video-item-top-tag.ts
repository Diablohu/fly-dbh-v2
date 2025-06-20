import { type VideoItemType, type VideoListPageTypesType } from "@/types";

const getVideoItemTopTag = (
    post: Partial<VideoItemType>,
    purpose: "latest" | "tutorial" | "news" | "review" | "world"
):
    | {
          type: VideoListPageTypesType;
          _id: string;
          name: string;
          slug?: string;
      }
    | undefined => {
    switch (purpose) {
        case "latest":
            return post.tags?.[0]
                ? {
                      type: "tag",
                      _id: post.tags[0]._id,
                      name: post.tags[0].name,
                      slug: post.tags[0].slug,
                  }
                : undefined;

        case "tutorial": {
            const thisTag = post.tags?.filter((tag) =>
                ["training", "tip", "aviation"].includes(tag.slug || "")
            )[0];
            return thisTag
                ? {
                      type: "tag",
                      _id: thisTag._id,
                      name: thisTag.name,
                      slug: thisTag.slug,
                  }
                : undefined;
        }

        case "news": {
            const thisTag = post.tags?.filter((tag) => tag.slug !== "news")[0];
            return thisTag
                ? {
                      type: "tag",
                      _id: thisTag._id,
                      name: thisTag.name,
                      slug: thisTag.slug,
                  }
                : post.developers?.[0]
                  ? {
                        type: "developer",
                        _id: post.developers[0]._id,
                        name: post.developers[0].name,
                        slug: post.developers[0].slug,
                    }
                  : undefined;
        }

        case "review": {
            return post.developers?.[0]
                ? {
                      type: "developer",
                      _id: post.developers[0]._id,
                      name: post.developers[0].name,
                      slug: post.developers[0].slug,
                  }
                : post.games?.[0]
                  ? {
                        type: "platform",
                        _id: post.games[0]._id,
                        name: post.games[0].name,
                        slug: post.games[0].slug,
                    }
                  : undefined;
        }

        case "world": {
            const thisTag = post.tags?.filter((tag) =>
                ["extreme-airport"].includes(tag.slug || "")
            )[0];
            return thisTag
                ? {
                      type: "tag",
                      _id: thisTag._id,
                      name: thisTag.name,
                      slug: thisTag.slug,
                  }
                : undefined;
        }

        default:
            return undefined;
    }
};

export default getVideoItemTopTag;
