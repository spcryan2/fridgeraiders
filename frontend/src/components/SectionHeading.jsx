// programme-style heading: "I. The ensemble"
function SectionHeading({ numeral, children, aside }) {
  return (
    <h2 className="flex items-baseline gap-3 border-b border-ink/15 pb-2">
      <span className="font-display text-lg text-accent italic">{numeral}.</span>
      <span className="font-display text-2xl font-semibold">{children}</span>
      {aside && <span className="ml-auto text-sm text-ink-soft">{aside}</span>}
    </h2>
  );
}

export default SectionHeading;
