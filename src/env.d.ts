declare namespace App {
    // Add locale strings to Astro Context
    interface Locals {
        //
    }
}

// Add properties to browser's window object
interface Window {
    //
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
