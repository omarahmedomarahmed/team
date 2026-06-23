import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-32 text-center">
      <span className="eyebrow justify-center">Error 404</span>
      <h1 className="title-xl mt-5">Page not found</h1>
      <p className="lead mt-4 max-w-md mx-auto">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back home
      </Link>
    </section>
  );
}
