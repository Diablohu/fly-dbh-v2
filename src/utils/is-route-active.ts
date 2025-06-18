const isRouteActive = (route: string, currentPathname: string) =>
    (route === "/" && currentPathname === route) ||
    (route !== "/" && new RegExp(`^${route}(\/|$)`).test(currentPathname));

export default isRouteActive;
