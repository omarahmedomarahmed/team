import { youtubeEmbedUrl } from "@/lib/video";

/**
 * Responsive, in-site YouTube player (16:9). Uses the privacy-friendly
 * youtube-nocookie host. Falls back to a plain link if the URL can't be parsed.
 */
export function VideoEmbed({ url, title = "Video" }: { url: string; title?: string }) {
  const embed = youtubeEmbedUrl(url);
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="btn btn-primary">
        Watch the video
      </a>
    );
  }
  return (
    <div className="media-frame aspect-video overflow-hidden">
      <iframe
        src={embed}
        title={title}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
