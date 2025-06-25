import numeral from "numeral";

const getGameUpdateName = ({
    series,
    number,
}: {
    series: string;
    number: string | number;
}) => {
    if (series === "exp") return `扩展包：${number}`;
    return `${series.toUpperCase()}_${numeral(number).format("00")}`;
};

export default getGameUpdateName;
