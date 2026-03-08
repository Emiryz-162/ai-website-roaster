import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getRoast, StoredRoast } from "@/lib/roastStore";
import Logo from "@/components/Logo";
import RoastResult from "@/components/RoastResult";
import AnimatedBackground from "@/components/AnimatedBackground";
import { LanguageProvider } from "@/context/LanguageContext";

interface Props {
  entry: StoredRoast;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = params?.id;
  if (typeof id !== "string") return { notFound: true };

  const entry = getRoast(id);
  if (!entry) return { notFound: true };

  // JSON-serialise the entry (Next.js requires plain objects from getServerSideProps)
  return {
    props: { entry: JSON.parse(JSON.stringify(entry)) },
  };
};

export default function SharedRoastPage({ entry }: Props) {
  const { result } = entry;
  const headline = result.roast.headline;
  const roastSnippet = result.roast.roast.slice(0, 160);
  const ogDescription = `${roastSnippet}…`;

  return (
    <>
      <Head>
        <title>{headline} | AI Website Roaster</title>
        <meta name="description" content={ogDescription} />
        {/* Open Graph */}
        <meta property="og:title" content={headline} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="article" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={headline} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* LanguageProvider so RoastResult can read language context */}
      <LanguageProvider>
        <AnimatedBackground>
          <div className="min-h-screen flex flex-col">
            {/* Nav */}
            <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5">
              <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="AI Website Roaster — home">
                <Logo width={160} height={36} />
              </Link>
              <Link
                href="/"
                className="text-xs text-smoke/50 hover:text-smoke/80 transition-colors px-3 py-1.5
                           rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
              >
                ← Roast a site
              </Link>
            </nav>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pt-12 pb-20 gap-8">
              {/* Shared badge */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                             bg-flame/10 border border-flame/20 text-flame text-xs font-medium"
                >
                  <span aria-hidden="true">🔗</span>
                  Shared Roast
                </div>
                <p className="text-smoke/40 text-sm">
                  Roast of{" "}
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-flame/60 hover:text-flame underline transition-colors"
                  >
                    {entry.url}
                  </a>
                </p>
                <p className="text-smoke/25 text-xs">
                  Expires {new Date(entry.createdAt + 24 * 60 * 60 * 1000).toLocaleString()}
                </p>
              </div>

              {/* Roast result (reuse the same component) */}
              <RoastResult result={result} />
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-smoke/25">
              Built with Next.js + OpenAI. Screenshots may not work on bot-protected sites.
            </footer>
          </div>
        </AnimatedBackground>
      </LanguageProvider>
    </>
  );
}
