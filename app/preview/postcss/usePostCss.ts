import { useEffect, useState } from "react";
import { createWorkerFactory, useWorkerMemo } from "use-worker-promise";

const workerLoader = createWorkerFactory<
  typeof import("./postcss.worker").processCss
>(
  () =>
    new Worker(new URL("./postcss.worker.ts", import.meta.url), {
      type: "module",
    })
);

/**
 * Webworker based ReactHook to compile the given CSS using the custom
 * postcss plugin
 */
export const usePostCss = (css: string) => {
  const [result, setResult] = useState<undefined | string>(undefined);
  const workerResult = useWorkerMemo(workerLoader, css);
  useEffect(() => {
    if (workerResult === null) {
      // ignore errors
      return;
    }
    setResult(workerResult);
  }, [workerResult]);
  return result;
};
