function calculateRunwaySlope(
    /** 跑道入口高度，单位 ft */
    elevationStartInFeet: number,
    /** 跑道末端高度，单位 ft */
    elevationEndInfFeet: number,
    /** 跑道长度，单位 ft */
    lengthInFeet: number
): { percentage: number; degrees: number };
function calculateRunwaySlope(
    /** 跑道入口高度，单位 ft */
    elevationStartInFeet: number,
    /** 跑道末端高度，单位 ft */
    elevationEndInfFeet: number,
    /** 跑道长度，单位 ft */
    lengthInFeet: number,
    /** 返回类型 */
    returnType: "data"
): { percentage: number; degrees: number };
function calculateRunwaySlope(
    /** 跑道入口高度，单位 ft */
    elevationStartInFeet: number,
    /** 跑道末端高度，单位 ft */
    elevationEndInfFeet: number,
    /** 跑道长度，单位 ft */
    lengthInFeet: number,
    /** 返回类型 */
    returnType: "text"
): string;

function calculateRunwaySlope(
    /** 跑道入口高度，单位 ft */
    elevationStartInFeet: number,
    /** 跑道末端高度，单位 ft */
    elevationEndInfFeet: number,
    /** 跑道长度，单位 ft */
    lengthInFeet: number,
    /** 返回类型 */
    returnType: "data" | "text" = "data"
) {
    const rise = elevationEndInfFeet - elevationStartInFeet;
    const run = lengthInFeet;
    const percentage = (rise / run) * 100;
    const degrees = Math.atan(rise / run) * (180 / Math.PI);

    if (returnType === "data") {
        return {
            percentage,
            degrees,
        };
    }

    return `${percentage.toFixed(2)}% (${degrees.toFixed(2)}°)`;
}

export default calculateRunwaySlope;
