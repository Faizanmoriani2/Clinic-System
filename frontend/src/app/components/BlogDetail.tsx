import { type ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarDays, FileText, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { api, ApiOne } from "../lib/api";
import type { Blog } from "../lib/types";
import { setMetaDescription } from "./Blogs";

export function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    api
      .get<ApiOne<Blog>>(`/blogs/slug/${slug}`)
      .then((res) => {
        setBlog(res.data);
        if (res.data) {
          document.title = `${res.data.title} | Allergy Clinic Blog`;
          setMetaDescription(makeExcerpt(res.data.content, 155));
        }
      })
      .catch(() => toast.error("Could not load this blog"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="pb-24 sm:pb-10">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link to="/blogs" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading article
            </div>
          ) : blog ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Allergy clinic blog
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  Patient education
                </span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">{blog.title}</h1>
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <h1 className="text-xl font-semibold">Blog not found</h1>
              <p className="mt-2 text-sm text-slate-500">The article may have been removed.</p>
            </div>
          )}
        </div>
      </section>

      {blog && (
        <article className="mx-auto max-w-3xl px-4 py-6">
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="mb-6 aspect-[16/9] w-full rounded-lg object-cover"
            />
          )}
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
            <div className="space-y-5 text-base leading-8 text-slate-700">
              <FormattedBlogContent content={blog.content} />
            </div>
          </div>
        </article>
      )}
    </main>
  );
}

function FormattedBlogContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "bullets") {
          return (
            <ul key={`bullets-${index}`} className="list-disc space-y-2 pl-6">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "numbers") {
          return (
            <ol key={`numbers-${index}`} className="list-decimal space-y-2 pl-6">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineFormatting(item)}</li>
              ))}
            </ol>
          );
        }

        return <p key={`paragraph-${index}`}>{renderInlineFormatting(block.text)}</p>;
      })}
    </>
  );
}

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbers"; items: string[] };

function parseBlocks(content: string): ContentBlock[] {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: "bullets", items: bullets });
      bullets = [];
    }
  };
  const flushNumbers = () => {
    if (numbers.length) {
      blocks.push({ type: "numbers", items: numbers });
      numbers = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const numberMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (!trimmed) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      return;
    }

    if (bulletMatch) {
      flushParagraph();
      flushNumbers();
      bullets.push(bulletMatch[1]);
      return;
    }

    if (numberMatch) {
      flushParagraph();
      flushBullets();
      numbers.push(numberMatch[1]);
      return;
    }

    flushBullets();
    flushNumbers();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushBullets();
  flushNumbers();

  return blocks;
}

function renderInlineFormatting(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function makeExcerpt(content: string, limit: number) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length > limit ? `${compact.slice(0, limit - 3)}...` : compact;
}
