// Head-and-shoulders outline of a seated caller, centred at the bottom of a
// 16:9 frame. Drawn over background previews so a logo spot can be judged
// against where a person actually sits on camera.
export default function WebcamSilhouette({ opacity = 0.45 }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <path
        d="M800 250c-92 0-160 78-160 178 0 70 30 128 76 158-150 36-262 140-290 314h748c-28-174-140-278-290-314 46-30 76-88 76-158 0-100-68-178-160-178z"
        fill={`rgba(17, 24, 39, ${opacity})`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="4"
        strokeDasharray="14 10"
      />
    </svg>
  );
}
