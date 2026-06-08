function updateRootCssVariable(
    name: "--theme-color" | "--rt-global-sidebar-height",
    value: string | number | false,
) {
    if (typeof value === "string")
        document.documentElement.style.setProperty(name, value);
    else if (typeof value === "number")
        document.documentElement.style.setProperty(name, value + "px");
    else document.documentElement.style.removeProperty(name);
}

export default updateRootCssVariable;
