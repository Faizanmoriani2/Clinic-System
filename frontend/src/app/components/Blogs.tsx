import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { api, ApiList } from "../lib/api";
import type { Blog } from "../lib/types";

export function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = "Allergy Clinic Blog | Allergy Treatment Articles";
    setMetaDescription(
      "Read allergy clinic articles about symptoms, treatment, appointments, and specialist care in Quetta, Sukkur, and Ghotki."
    );

    api
      .get<ApiList<Blog>>("/blogs")
      .then((res) => setBlogs(res.data))
      .catch(() => toast.error("Could not load blogs"))
      .finally(() => setLoading(false));
  }, []);

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return blogs;

    return blogs.filter((blog) =>
      [blog.title, blog.content, ...(blog.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [blogs, query]);

  return (
    <main className="pb-24 sm:pb-10">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
            <FileText className="h-4 w-4" />
            Allergy resources
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Allergy clinic blogs and patient education
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Browse clinic updates and helpful allergy treatment guidance for patients in Quetta, Sukkur, and Ghotki.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-3">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs by title, tag, or topic"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading blogs
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No blogs found.
          </div>
        )}
      </section>
    </main>
  );
}

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {blog.featuredImage ? (
        <img src={blog.featuredImage} alt={blog.title} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-emerald-50 text-emerald-700">
          <FileText className="h-8 w-8" />
        </div>
      )}
      <article className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          {blog.tags?.slice(0, 3).join(", ") || "Clinic update"}
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-950">{blog.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{blog.content}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
          Read article
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </article>
    </Link>
  );
}

export function setMetaDescription(content: string) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}
