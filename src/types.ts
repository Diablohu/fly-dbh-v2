// export type LocaleType = "en" | "ja" | "zh";

// export type ReactComponentPropsWitchLocale<L = Record<string, string>> = {
//     _: L;
//     currentLocale: LocaleType;
// };

export type VideoArticleType = {
    id: number;
    title: string;
};

export type SanityResponseType<T> = {
    code: number;
    data: T;
    msg?: string;
};
