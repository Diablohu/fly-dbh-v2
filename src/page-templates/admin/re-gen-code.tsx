import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type FC,
    type MouseEventHandler,
} from "react";
import qrcode from "qrcode";

// ============================================================================

type StatusType = "ready" | "loading" | "error";

// ============================================================================

const ReGenCode: FC = () => {
    if (!import.meta.env.DEV) return null;

    const CanvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<StatusType>("ready");
    const [result, setResult] = useState<string>();

    const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
        async (evt) => {
            evt.preventDefault();

            if (status === "loading") return;

            const href = evt.currentTarget.getAttribute("href");
            if (!href) return;

            setStatus("loading");
            const res = await fetch(href);
            setResult((await res.json()).uri);
            setStatus("ready");
        },
        [status]
    );

    useEffect(() => {
        if (!result) return;
        if (!CanvasRef.current) return;
        qrcode.toCanvas(CanvasRef.current, result);
    }, [result]);

    return (
        <>
            <a href="/admin/re-generate-code" target="_blank" onClick={onClick}>
                Regenerate Code
            </a>
            {result && <canvas ref={CanvasRef} />}
        </>
    );
};
export default ReGenCode;
