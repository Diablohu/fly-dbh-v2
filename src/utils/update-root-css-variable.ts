function updateRootCssVariable(name: "--theme-color", value: string | false) {
    if (typeof value === "string")
        document.documentElement.style.setProperty(name, value);
    else document.documentElement.style.removeProperty(name);
}

export default updateRootCssVariable;
