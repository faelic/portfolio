import { play } from "cuelume";
import "./PendantLamp.css";

interface PendantLampProps {
  lightOn: boolean;
  onToggle: () => void;
  subdued?: boolean;
}

const LAMP_CLICK_VOLUME = 1;

export function PendantLamp({ lightOn, onToggle, subdued = false }: PendantLampProps) {
  return (
    <div
      className={`pendant-lamp${lightOn ? " is-on" : " is-off"}${subdued ? " is-subdued" : ""}`}
    >
      <button
        className="pendant-lamp__control"
        type="button"
        aria-label={lightOn ? "Turn light off" : "Turn light on"}
        aria-pressed={lightOn}
        onPointerDown={() => play("press", { volume: LAMP_CLICK_VOLUME })}
        onClick={onToggle}
      >
        <span className="sr-only">{lightOn ? "Turn light off" : "Turn light on"}</span>
      </button>

      <div className="pendant-lamp__ambient" />
      <div className="pendant-lamp__source-glow" />
      <div className="pendant-lamp__beam pendant-lamp__beam--outer" />
      <div className="pendant-lamp__beam pendant-lamp__beam--inner" />
      <div className="pendant-lamp__pool" />
      <span className="pendant-lamp__source-anchor" aria-hidden="true" />

      <img
        className="pendant-lamp__fixture"
        src={lightOn ? "/assets/effects/pendant-lamp-fixture.png" : "/assets/effects/pendant-lamp-fixture-off.png"}
        width="816"
        height="1010"
        alt=""
        draggable="false"
      />
    </div>
  );
}

export default PendantLamp;
