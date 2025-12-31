"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  PenLine,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  DajialaArticle,
  DajialaArticleHtmlData,
  DajialaArticleHtmlResponse,
  DajialaResponse,
} from "@/lib/dajiala";
import { readJson } from "@/lib/http";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AnalysisApiResponse =
  | { ok: true; data: DajialaResponse }
  | { ok: false; error: string };

type ArticleHtmlApiResponse =
  | { ok: true; data: DajialaArticleHtmlResponse }
  | { ok: false; error: string };

type RewriteApiResponse =
  | { ok: true; data: { title: string; content: string } }
  | { ok: false; error: string };

type DraftItem = {
  id: string;
  title: string;
  content: string;
  status: "draft" | "ready";
  updatedAt: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

const STORAGE_KEY = "create-articles-cache-v1";
const DRAFTS_KEY = "publish-items-v1";

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function getEngagement(article: DajialaArticle) {
  const read = Number(article.read) || 0;
  const praise = Number(article.praise) || 0;
  const looking = Number(article.looking) || 0;
  if (read === 0) return 0;
  return (praise + looking) / read;
}

function stripScripts(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

function dedupeArticles(items: DajialaArticle[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key =
      item.url ||
      item.short_link ||
      item.ghid ||
      `${item.title}-${item.publish_time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadDrafts(): DraftItem[] {
  if (typeof window === "undefined") return [];
  const cached = localStorage.getItem(DRAFTS_KEY);
  if (!cached) return [];
  try {
    const parsed = JSON.parse(cached) as DraftItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDrafts(list: DraftItem[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(list));
}

function getFirstImage(markdown: string) {
  const match = markdown.match(/!\[[^\]]*]\(([^)]+)\)/);
  return match?.[1] || "";
}

async function readApiJson<T>(res: Response, label: string) {
  const parsed = await readJson<T>(res);
  if (!parsed.ok) {
    return {
      ok: false as const,
      error: `${label}返回非 JSON 响应（${res.status}）。`,
    };
  }
  return { ok: true as const, data: parsed.data };
}

export default function CreatePage() {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<DajialaArticle[]>([]);
  const [articleCache, setArticleCache] = useState<
    Record<string, DajialaArticleHtmlData>
  >({});
  const [activeArticle, setActiveArticle] = useState<DajialaArticle | null>(
    null
  );
  const [activeDetail, setActiveDetail] =
    useState<DajialaArticleHtmlData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteTarget, setRewriteTarget] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as {
        keyword?: string;
        articles?: DajialaArticle[];
        articleCache?: Record<string, DajialaArticleHtmlData>;
        activeUrl?: string;
      };
      setKeyword(parsed.keyword ?? "");
      setArticles(parsed.articles ?? []);
      setArticleCache(parsed.articleCache ?? {});
      if (parsed.activeUrl && parsed.articles) {
        const matched = parsed.articles.find(
          (item) => item.url === parsed.activeUrl
        );
        if (matched) {
          setActiveArticle(matched);
          setActiveDetail(parsed.articleCache?.[parsed.activeUrl] ?? null);
        }
      }
    } catch {
      setArticles([]);
    }
  }, []);

  useEffect(() => {
    const payload = {
      keyword,
      articles,
      articleCache,
      activeUrl: activeArticle?.url ?? "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [keyword, articles, articleCache, activeArticle]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  const activeHtml = useMemo(() => {
    if (!activeDetail?.html) return "";
    return stripScripts(activeDetail.html);
  }, [activeDetail]);

  const coverImage = useMemo(() => getFirstImage(markdown), [markdown]);

  const fetchArticles = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setError("请输入关键词后再抓取。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kw: trimmed,
          period: 7,
          sort_type: 1,
          mode: 1,
          page: 1,
          type: 1,
        }),
      });

      const parsed = await readApiJson<AnalysisApiResponse>(res, "抓取接口");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "抓取失败，请稍后再试。");
        return;
      }

      const rawList = data.data.data ?? [];
      const unique = dedupeArticles(rawList);
      setArticles(unique.slice(0, 5));
    } catch (err) {
      const message = err instanceof Error ? err.message : "抓取失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadArticleHtml = async (article: DajialaArticle) => {
    setActiveArticle(article);
    setDetailError(null);

    const cached = articleCache[article.url];
    if (cached) {
      setActiveDetail(cached);
      return cached;
    }

    setDetailLoading(true);
    setActiveDetail(null);

    try {
      const res = await fetch("/api/article-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.url }),
      });

      const parsed = await readApiJson<ArticleHtmlApiResponse>(
        res,
        "正文接口"
      );
      if (!parsed.ok) {
        setDetailError(parsed.error);
        return null;
      }

      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setDetailError(!data.ok ? data.error : "获取正文失败。");
        return null;
      }

      if (!data.data?.data) {
        setDetailError("未获取到正文内容。\n");
        return null;
      }

      setActiveDetail(data.data.data);
      setArticleCache((prev) => ({
        ...prev,
        [article.url]: data.data.data,
      }));
      return data.data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取正文失败";
      setDetailError(message);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRewrite = async (article: DajialaArticle) => {
    setRewriteLoading(true);
    setRewriteTarget(article.url);
    setError(null);

    try {
      const detail = (await loadArticleHtml(article)) ?? activeDetail;
      if (!detail) {
        setError("无法获取正文，改写失败。");
        return;
      }

      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: detail.title || article.title,
          html: detail.html,
          coverUrl: detail.cover_url,
          sourceUrl: detail.article_url || article.url,
        }),
      });

      const parsed = await readApiJson<RewriteApiResponse>(res, "改写接口");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "改写失败，请稍后再试。");
        return;
      }

      setTitle(data.data.title || detail.title || article.title);
      setMarkdown(data.data.content || "");
      setDraftId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "改写失败";
      setError(message);
    } finally {
      setRewriteLoading(false);
      setRewriteTarget(null);
    }
  };

  const handleSave = (status: "draft" | "ready") => {
    const trimmedTitle = title.trim() || activeArticle?.title || "未命名文章";
    const trimmedContent = markdown.trim();

    if (!trimmedContent) {
      setError("请先生成或填写正文内容再保存。");
      return;
    }

    const list = loadDrafts();
    const now = new Date().toISOString();
    const id = draftId ?? crypto.randomUUID();
    const payload: DraftItem = {
      id,
      title: trimmedTitle,
      content: trimmedContent,
      status,
      updatedAt: now,
      sourceTitle: activeArticle?.title,
      sourceUrl: activeArticle?.url,
    };

    const next = list.some((item) => item.id === id)
      ? list.map((item) => (item.id === id ? payload : item))
      : [payload, ...list];

    saveDrafts(next);
    setDraftId(id);
    setSaveMessage(status === "draft" ? "草稿已保存" : "已保存到发布管理");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="内容创作"
        description="输入关键词抓取公众号文章，一键改写为 Markdown 并保存到发布管理。"
        badge="创作工作台"
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">选题来源</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入关键词，例如：冬虫夏草"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <Button
                className="rounded-full"
                onClick={fetchArticles}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "抓取"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              默认抓取 5 篇，自动去重。
            </p>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}

            <div className="space-y-3">
              {articles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-white/60 p-4 text-xs text-muted-foreground">
                  暂无数据，输入关键词后点击“抓取”。
                </div>
              ) : (
                articles.map((article) => {
                  const isRewriting = rewriteLoading && rewriteTarget === article.url;
                  return (
                    <div
                      key={`${article.wx_id}-${article.short_link}`}
                      className={`rounded-xl border border-border/60 bg-white/70 p-3 transition ${
                        activeArticle?.url === article.url
                          ? "border-foreground"
                          : "hover:border-foreground"
                      }`}
                    >
                      <div className="text-sm font-medium line-clamp-2">
                        {article.title}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>阅读 {formatCompact(Number(article.read))}</span>
                        <span>点赞 {formatCompact(Number(article.praise))}</span>
                        <span>在看 {formatCompact(Number(article.looking))}</span>
                        <Badge variant="outline" className="rounded-full">
                          互动率 {(getEngagement(article) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => loadArticleHtml(article)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          阅读全文
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleRewrite(article)}
                          disabled={rewriteLoading}
                        >
                          {isRewriting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          {isRewriting ? "改写中" : "改写"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          asChild
                        >
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            打开链接
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">正文预览</p>
                {activeArticle ? (
                  <Badge variant="secondary" className="rounded-full">
                    {activeArticle.wx_name}
                  </Badge>
                ) : null}
              </div>
              <ScrollArea className="h-[260px] rounded-xl border border-border/60 bg-white/70 p-3">
                {detailLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在加载正文...
                  </div>
                ) : detailError ? (
                  <div className="text-xs text-rose-600">{detailError}</div>
                ) : activeHtml ? (
                  <div
                    className="space-y-3 text-xs leading-6 text-foreground"
                    dangerouslySetInnerHTML={{ __html: activeHtml }}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    选择文章后可在此查看全文内容。
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Markdown 编辑器
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                支持手动编辑与 AI 改写后的内容。
              </p>
            </div>
            <Badge variant={rewriteLoading ? "secondary" : "outline"} className="rounded-full">
              {rewriteLoading ? "改写中" : "草稿"}
            </Badge>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="输入标题，例如：冬虫夏草的正确吃法"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            {rewriteLoading ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-white/60 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在改写中，请稍候...
              </div>
            ) : null}

            {coverImage ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
                <img src={coverImage} alt="封面" className="w-full" />
              </div>
            ) : null}

            <Tabs defaultValue="edit" className="mt-5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">编辑</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Textarea
                  className="min-h-[420px]"
                  placeholder="请输入 Markdown 内容，支持标题、列表、引用等格式。"
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                {markdown ? (
                  <div className="prose prose-neutral max-w-none rounded-xl border border-border/60 bg-white/70 p-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="min-h-[420px] rounded-xl border border-dashed border-border/70 bg-white/60 p-4 text-sm text-muted-foreground">
                    预览区域：改写完成后可查看排版预览。
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleSave("draft")}
                disabled={rewriteLoading}
              >
                <PenLine className="mr-2 h-4 w-4" />
                保存草稿
              </Button>
              <Button
                className="rounded-full"
                onClick={() => handleSave("ready")}
                disabled={rewriteLoading}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                保存到发布管理
              </Button>
              {saveMessage ? (
                <span className="text-xs text-emerald-600">{saveMessage}</span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
