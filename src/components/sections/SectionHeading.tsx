export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="title-lg mt-4">
        {title} {highlight ? <span className="gradient-text">{highlight}</span> : null}
      </h2>
      {subtitle ? <p className="lead mt-4">{subtitle}</p> : null}
    </div>
  );
}
