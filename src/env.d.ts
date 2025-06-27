import { ActionError } from "astro:actions";
import { type BrowserHistory, type HashHistory } from "history";
import { type ValidVideoSourceType } from "@/types";

declare namespace App {
    // Add locale strings to Astro Context
    // Can store other infos for rendering
    interface Locals {
        IMPORTANT_ACTION_ERROR?: ActionError;
    }
}

// Add properties to browser's window object
declare global {
    interface Window {
        _browserHistory?: BrowserHistory;
        _hashHistory?: HashHistory;
        _contentRoot: HTMLDivElement;
    }
}

declare namespace astroHTML.JSX {
    // Add attributes to JSX element
    interface HTMLAttributes {
        //
    }

    // Add CSS custom properties to the style object
    interface CSSProperties {
        //
    }
}

declare namespace React {
    // Add CSS properties to JSX style attribute
    interface CSSProperties {
        //
    }
}
