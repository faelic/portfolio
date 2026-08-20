import { useEffect } from "react";
import { bind, setVolume } from "cuelume";

const INTERFACE_VOLUME = 0.41;

export function useInterfaceSounds() {
  useEffect(() => {
    setVolume(INTERFACE_VOLUME);
    bind();
  }, []);
}
