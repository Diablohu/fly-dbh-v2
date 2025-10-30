export type RunwayType = {
    /** 跑道标识符 */
    identifier: string;
    /** 是否为当前挑战的跑道组 */
    isChallengePair: boolean;
    /** 是否为当前挑战的跑道 */
    isChallengeRunway: boolean;
    /** 跑道磁航向 */
    bearing: string;
    /** 跑道长度（米） */
    lengthInMeters: number;
    /** 跑道长度（英尺） */
    lengthInFeet: number;
    /** 跑道宽度（米） */
    widthInMeters: number;
    /** 跑道宽度（英尺） */
    widthInFeet: number;
    /** 跑道海拔（英尺） */
    elevationInFeet: number;
    /** 坡度（%） */
    slopePercentage: number;
    /** 坡度（°） */
    slopeDegrees: number;
};
