import numeral from "numeral";

const getGameUpdateName = ({
    series,
    number,
}: {
    series: string;
    number: string | number;
}) => {
    if (series === "exp") return `扩展包：${number}`;
    return `${series.toUpperCase()}_${
        typeof number === "string" && number.includes(".")
            ? numeral(number).format("00.0")
            : numeral(number).format("00")
    }`;
};

export default getGameUpdateName;
