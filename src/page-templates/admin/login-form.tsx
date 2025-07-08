import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type FC,
    type FormEventHandler,
} from "react";
import qrcode from "qrcode";

// ============================================================================

type StatusType = "ready" | "loading" | "error";

// ============================================================================

const LoginForm: FC = () => {
    if (!import.meta.env.DEV) return null;

    const [status, setStatus] = useState<StatusType>("ready");
    const [error, setError] = useState<string>();

    const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();

            if (status === "loading") return;

            const action = evt.currentTarget.getAttribute("action");
            const method = evt.currentTarget.getAttribute("method");
            if (!action) return;
            if (!method) return;

            setError("");
            setStatus("loading");
            const res = await fetch(action, {
                method: method.toUpperCase(),
                body: new FormData(evt.currentTarget),
            });

            if (res.status !== 200) {
                setStatus("error");
                setError(`Error: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();

            if (typeof data.expires === "number") window.location.reload();

            setStatus("ready");
        },
        [status]
    );

    return (
        <>
            <form action="/admin/login" method="post" onSubmit={onSubmit}>
                <input type="text" name="code" autoComplete="off" required />
                <input type="submit" value="GO" />
            </form>
            {status === "error" && <div>{error}</div>}
        </>
    );
};
export default LoginForm;
