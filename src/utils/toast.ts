import Toastify from "toastify-js";

const getToastifyOptions = (
    arg: string | Toastify.Options
): Toastify.Options => ({
    // duration: 3000,
    text: typeof arg === "string" ? arg : undefined,
    close: false,
    gravity: "top",
    position: "center",
    stopOnFocus: false,
    // style: {
    //     background: "linear-gradient(to right, #00b09b, #96c93d)",
    // },}
    ...(typeof arg !== "string" && arg),
});

// ============================================================================

export const success = (arg: string | Toastify.Options) => {
    const toast = Toastify({
        ...getToastifyOptions(arg),
    });
    toast.showToast();
    return toast;
};

export const error = (arg: string | Toastify.Options) => {
    const toast = Toastify({
        style: {
            background: "#b00020",
            color: "#ffffff",
        },
        ...getToastifyOptions(arg),
    });
    toast.showToast();
    return toast;
};

// ============================================================================

export default { success, error };
