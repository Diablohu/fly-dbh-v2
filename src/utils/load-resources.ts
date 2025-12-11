export async function loadResource(
    type: "script" | "style",
    src: string,
    id?: string,
    check?: () => boolean
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (id && document.querySelector(`#${id}`) instanceof Element)
            return resolve();
        if (check?.()) return resolve();

        let element: HTMLScriptElement | HTMLLinkElement;
        if (type === "script") {
            element = document.createElement("script");
            element.src = src;
            element.async = true;
        } else {
            element = document.createElement("link");
            element.rel = "stylesheet";
            element.href = src;
        }
        if (id) element.id = id;
        element.onload = () => resolve();
        element.onerror = () =>
            reject(new Error(`Failed to load resource: ${src}`));
        document.head.appendChild(element);
    });
}

async function loadResources(
    resources: {
        type: Parameters<typeof loadResource>[0];
        src: Parameters<typeof loadResource>[1];
        id?: Parameters<typeof loadResource>[2];
        check?: Parameters<typeof loadResource>[3];
    }[]
): Promise<void> {
    return Promise.allSettled(
        resources.map((resource) =>
            loadResource(
                resource.type,
                resource.src,
                resource.id,
                resource.check
            )
        )
    )
        .then(() => {})
        .catch((err) => console.error(err));
}

export default loadResources;
