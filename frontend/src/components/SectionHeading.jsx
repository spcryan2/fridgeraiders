// chunky logo-style heading with an optional note on the right
function SectionHeading({ children, aside }) {
  return (
    <h2 className="flex items-baseline gap-3">
      <span className="wordmark text-2xl">{children}</span>
      {aside && (
        <span className="ml-auto rounded-full bg-forest/8 px-2.5 py-0.5 text-xs font-semibold text-forest/70">
          {aside}
        </span>
      )}
    </h2>
  );
}

export default SectionHeading;
