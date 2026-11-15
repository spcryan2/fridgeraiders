// the little streak flame
function Flame({ className = "" }) {
  return (
    <svg viewBox="0 0 16 18" className={className} aria-hidden="true">
      <path
        d="M8 1c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Flame;
