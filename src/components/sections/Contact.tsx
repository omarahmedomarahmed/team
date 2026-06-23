import type { ContactData } from "@/lib/types";
import type { Settings } from "@/lib/site";
import { ContactForm } from "@/components/site/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";

export function Contact({ data, settings }: { data: ContactData; settings: Settings }) {
  const cc = settings.contactConfig as { fields?: { name: string; label: string; type: string; required?: boolean; options?: string[] }[] } | undefined;
  const fields = cc && Array.isArray(cc.fields) && cc.fields.length ? cc.fields : undefined;
  return (
    <section className="container-x section-pad">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <Reveal>
          <div>
            {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
            <h2 className="title-lg mt-4">
              {data.title}{" "}
              {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
            </h2>
            {data.subtitle ? <p className="lead mt-4">{data.subtitle}</p> : null}

            <div className="mt-8 space-y-5 text-sm">
              {settings.email ? (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 group">
                  <span className="icon-badge"><Icon name="mail" size={18} /></span>
                  <span className="group-hover:text-brand transition-colors">{settings.email}</span>
                </a>
              ) : null}
              {settings.phone ? (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 group">
                  <span className="icon-badge"><Icon name="phone" size={18} /></span>
                  <span className="group-hover:text-brand transition-colors">{settings.phone}</span>
                </a>
              ) : null}
              {settings.address ? (
                <div className="flex items-center gap-3">
                  <span className="icon-badge"><Icon name="map-pin" size={18} /></span>
                  <span>{settings.address}</span>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        {data.showForm === false ? null : (
          <Reveal delay={0.12}>
            <ContactForm fields={fields} />
          </Reveal>
        )}
      </div>
    </section>
  );
}
