import { useState, useCallback, type FC, type SubmitEventHandler } from "react";
import { actions } from "astro:actions";

// ============================================================================

type StatusType = "ready" | "loading" | "error";
const loginAction = actions.admin.login;

// ============================================================================

const LoginForm: FC = () => {
    const [status, setStatus] = useState<StatusType>("ready");
    const [error, setError] = useState<string>();

    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();

            if (status === "loading") return;

            // const action = evt.currentTarget.getAttribute("action");
            // const method = evt.currentTarget.getAttribute("method");
            // if (!action) return;
            // if (!method) return;

            setError("");
            setStatus("loading");
            // const res = await fetch(action, {
            //     method: method.toUpperCase(),
            //     body: new FormData(evt.currentTarget),
            // });
            const { data, error } = await loginAction(
                new FormData(evt.currentTarget),
            );

            // if (res.status !== 200) {
            //     setStatus("error");
            //     setError(`Error: ${res.status} ${res.statusText}`);
            //     return;
            // }
            if (!data || error) {
                setStatus("error");
                setError(`${error?.status} ${error?.code}`);
                return;
            }

            // const data = await res.json();

            if (typeof data.expires === "number") window.location.reload();

            setStatus("ready");
        },
        [status],
    );

    return (
        <>
            <form
                action={loginAction}
                method="POST"
                onSubmit={onSubmit}
                encType="multipart/form-data"
            >
                <input type="text" name="code" autoComplete="off" required />
                <input type="submit" value="GO" />
            </form>
            {status === "error" && <div>{error}</div>}
        </>
    );
};
export default LoginForm;
