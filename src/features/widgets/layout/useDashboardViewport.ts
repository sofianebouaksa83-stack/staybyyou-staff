import {
  useEffect,
  useState,
} from "react";

import type {
  DashboardViewport,
} from "./dashboardLayout.types";

const DESKTOP_BREAKPOINT =
  1024;

function readViewport(): DashboardViewport {
  if (
    typeof window ===
    "undefined"
  ) {
    return "desktop";
  }

  return window.innerWidth >=
    DESKTOP_BREAKPOINT
    ? "desktop"
    : "mobile";
}

export function useDashboardViewport() {
  const [
    viewport,
    setViewport,
  ] = useState<
    DashboardViewport
  >(readViewport);

  useEffect(() => {
    function handleResize() {
      setViewport(
        readViewport()
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return viewport;
}
