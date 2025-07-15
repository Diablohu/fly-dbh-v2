import { type FC } from "react";

import { type Props } from "./symbol.astro";

// ============================================================================

const Symbol: FC<Props> = ({ name }) => {
    return (
        <svg fill="currentColor" focusable="false" aria-hidden="true">
            <use xlinkHref={`#_g-symbol-${name}`}></use>
        </svg>
    );
};

export default Symbol;
