const isRouteActive = (
    route: string,
    currentPathname: string,
    extraChecks?: RegExp[]
) =>
    (route === "/" && currentPathname === route) ||
    (route !== "/" &&
        (new RegExp(`^${route}(\/|$)`).test(currentPathname) ||
            extraChecks?.some((regex) => regex.test(currentPathname))));

export default isRouteActive;
