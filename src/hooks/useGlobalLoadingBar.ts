import type { LoadingBarInst } from "naive-ui/es/loading-bar/src/LoadingBarProvider";
let loadingBar: LoadingBarInst | null = null;
export default function useGlobalLoadingBar() {
    const obj = {};
    ["error", "finish", "start"].forEach((key) => {
        (obj as any)[key] = () => {
            (loadingBar as any)?.[key]();
        };
    });
    return obj as LoadingBarInst;
}
export function hookBar(l: LoadingBarInst | null) {
    loadingBar = l;
}
