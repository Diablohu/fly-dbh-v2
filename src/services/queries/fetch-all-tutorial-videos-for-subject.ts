import type { SanityDocument } from "@sanity/client";

import {
    type VideoListPageTypeAircraftFamily,
    type VideoListPageTypeAircraftOnboardDevice,
    type VideoItemType,
} from "@/types";
import { extraAviationKnowledgeTitle } from "@/global";
import { E50000 } from "@/constants/error-codes";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/services/sanity-helpers";

// ============================================================================

/**
 * 返回所有和目标有关的 `教学` 视频
 *  - 注：缩略图地址已转化
 */
function fetchAllTutorialVideosForSubject<T extends Partial<VideoItemType>>(
    subject: {
        _id: string;
        type:
            | VideoListPageTypeAircraftFamily
            | VideoListPageTypeAircraftOnboardDevice;
        onboardDevices?: {
            _id: string;
            label: string;
        }[];
        /**
         * 飞机特殊标签，用以查询相关的内容
         *  - 如：有现代航电
         */
        aircraftTags?: string[];
    },
    settings: {
        projection?: string;
        order?: string;
    } = {}
) {
    type ReturnType = {
        [type: string]: SanityDocument<T>[];
    };

    const { projection = "", order = "release desc" } = settings;

    function getGorq(ref: string) {
        return `
*[_type=="video" && "tutorial" in tags[]->slug.current && references(${ref})]
    ${projection}
    | order(${order})`;
    }

    /** 额外查询的 GROQ */
    const toQuery = [
        {
            name: "教程攻略",
            query: getGorq(`"${subject._id}"`),
        },
    ];

    // 如果项目有 `机载设备`，添加到查询
    if (
        Array.isArray(subject.onboardDevices) &&
        subject.onboardDevices.length > 0
    ) {
        subject.onboardDevices?.forEach(({ _id, label }) => {
            toQuery.push({
                name: `机载设备 (${label}) 教学`,
                query: getGorq(`"${_id}"`),
            });
        });
    }

    // 如果项目有 `标签`，添加到查询
    if (
        Array.isArray(subject.aircraftTags) &&
        subject.aircraftTags.length > 0
    ) {
        toQuery.push({
            name: extraAviationKnowledgeTitle,
            query: getGorq(
                `[${subject.aircraftTags.map((_id) => `"${_id}"`).join(",")}]`
            ),
        });
    }

    return fetch(
        "{" +
            toQuery
                .map(({ name, query }) => `'${name}' : ${query},`)
                .join("\n") +
            "}",
        {
            transform: (res, queryString) => {
                if (!res) {
                    const err = new Error(E50000);
                    err.message = "NOT_FOUND";
                    err.name = E50000;
                    err.cause = { GROQ: queryString };
                    throw err;
                }

                // console.log(queryString)

                const list = res as unknown as ReturnType;

                // 最终处理获取的列表
                for (const [type, posts] of Object.entries(list)) {
                    // 如果该类别没有数据，过滤掉
                    if (!Array.isArray(posts) || !posts.length)
                        delete list[type];

                    // 如果不是 `航空知识` 类别
                    // 过滤掉在 `航空知识` 类别中出现的视频
                    if (type !== extraAviationKnowledgeTitle) {
                        list[type] = posts.filter((post) =>
                            list[extraAviationKnowledgeTitle].every(
                                ({ _id }) => _id !== post._id
                            )
                        );
                    }
                }

                // 转化缩略图地址
                Object.values(list).forEach((list) => {
                    list.forEach((post) => {
                        post.cover = post.cover
                            ? transformImagePath(post.cover)
                            : undefined;
                    });
                });

                return res;
            },
        }
    ) as unknown as Promise<ReturnType>;
}

export default fetchAllTutorialVideosForSubject;
