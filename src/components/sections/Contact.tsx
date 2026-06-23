import type { ContactData } from "@/lib/types";
import type { Settings } from "@/lib/site";
import { ContactForm } from "@/components/site/ContactForm";

export function Contact({ data, settings }: { data: ContactData; settings: Settings }) {
  return (
    <section className="container-x section-pad">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <div>
          {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
          <h2 className="title-lg mt-4">
            {data.title}{" "}
            {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
          </h2>
          {data.subtitle ? <p className="lead mt-4">{data.subtitle}</p> : null}

          <div className="mt-8 space-y-4 text-sm">
            {settings.email ? (
              <div>
                <div className="text-muted text-xs uppercase tracking-wider">Email</div>
                <a href={`mailto:${settings.email}`} className="hover:text-brand">
                  {settings.email}
                </a>
              </div>
            ) : null}
            {settings.phone ? (
              <div>
                <div className="text-muted text-xs uppercase tracking-wider">Phone</div>
                <a href={`tel:${settings.phone}`} className="hover:text-brand">
                  {settings.phone}
                </a>
              </div>
            ) : null}
            {settings.address ? (
              <div>
                <div className="text-muted text-xs uppercase tracking-wider">Office</div>
                <span>{settings.address}</span>
              </div>
            ) : null}
          </div>
        </div>

        {data.showForm === false ? null : <ContactForm />}
      </div>
    </section>
  );
}
