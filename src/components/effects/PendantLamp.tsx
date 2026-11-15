import "./PendantLamp.css";

interface PendantLampProps {
  lightOn: boolean;
  onToggle: () => void;
  subdued?: boolean;
}


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
        onClick={(event) => {
          onToggle();
          if (event.detail > 0) event.currentTarget.blur();
        }}
      >
        <span className="sr-only">{lightOn ? "Turn light off" : "Turn light on"}</span>
      </button>

      <div className="pendant-lamp__beam pendant-lamp__beam--outer" />
      <div className="pendant-lamp__beam pendant-lamp__beam--inner" />
      <span className="pendant-lamp__source-anchor" aria-hidden="true" />

      <img
        className="pendant-lamp__fixture pendant-lamp__fixture--off"
        src="/assets/effects/pendant-lamp-fixture-off.webp"
        width="816"
        height="1010"
        alt=""
        draggable="false"
      />
      <img
        className="pendant-lamp__fixture pendant-lamp__fixture--on"
        src="/assets/effects/pendant-lamp-fixture.webp"
        width="816"
        height="1010"
        alt=""
        draggable="false"
      />
    </div>
  );
}

export default PendantLamp;
