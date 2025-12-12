import { GLOBAL_PERSIST_RESOURCES_CONTAINER } from "@/constants/element-ids";

let elPersistContainer: HTMLDivElement | null = null;

export async function loadResource(
    type: "script" | "style",
    src: string,
    id?: string,
    options: {
        persist?: boolean | string;
        checkExist?: () => boolean;
    } = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (id && document.querySelector(`#${id}`) instanceof Element)
            return resolve();
        if (options.checkExist?.()) return resolve();

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
        if (options.persist) {
            if (!elPersistContainer)
                elPersistContainer = document.querySelector(
                    `#${GLOBAL_PERSIST_RESOURCES_CONTAINER}`
                );
            if (elPersistContainer) elPersistContainer.appendChild(element);
        } else {
            document.head.appendChild(element);
        }
    });
}

async function loadResources(
    resources: {
        type: Parameters<typeof loadResource>[0];
        src: Parameters<typeof loadResource>[1];
        id?: Parameters<typeof loadResource>[2];
        options?: Parameters<typeof loadResource>[3];
    }[]
): Promise<void> {
    return Promise.allSettled(
        resources.map((resource) =>
            loadResource(
                resource.type,
                resource.src,
                resource.id,
                resource.options
            )
        )
    )
        .then(() => {})
        .catch((err) => console.error(err));
}

export default loadResources;
