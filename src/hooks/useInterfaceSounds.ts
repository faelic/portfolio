import { useEffect, useState } from "react";
import { setEnabled, setVolume } from "cuelume";
import { isBoolean, storage } from "../utils/storage";

export const VOLUME_KEY = "favour.interface-volume.v1";
const isVolume = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
export const SOUND_KEY = "favour.interface-sound.v1";
// All cuelume paths, including direct play calls, share this engine preference.
setEnabled(false);

export function useInterfaceSounds() {
  const [enabled, setSound] = useState(() => storage.read(SOUND_KEY, false, isBoolean));
  const [volume, setVolumePreference] = useState(() => storage.read(VOLUME_KEY, .2, isVolume));
  useEffect(() => {
    setEnabled(enabled && volume > 0);
    setVolume(volume);
    storage.write(VOLUME_KEY, volume);
    storage.write(SOUND_KEY, enabled);
  }, [enabled, volume]);
  return { enabled, volume, audible: enabled && volume > 0, setEnabled: setSound, setVolume: (value: number) => { if (isVolume(value)) setVolumePreference(value); }, toggle: () => { if (enabled && volume > 0) setSound(false); else { if (volume === 0) setVolumePreference(.2); setSound(true); } } };
}
