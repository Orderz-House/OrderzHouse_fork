import { useEffect, useState } from "react";
import { onGlobalLoading } from "./axiosLoading";
import LoadingScreen from "./LoadingScreen";

export default function GlobalLoadingProvider({ children }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onGlobalLoading(setActive);
    return unsubscribe;
  }, []);

  return (
    <>
      {active && <LoadingScreen text="Loading…" />}
      {children}
    </>
  );
}
