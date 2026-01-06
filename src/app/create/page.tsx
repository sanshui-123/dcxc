"use client";

import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  | { ok: true; data: { title: string; content: string; topic?: string } }
  | { ok: false; error: string };

type PromptsApiResponse =
  | { ok: true; data: PromptItem[] }
  | { ok: false; error: string };

type HotArticlesApiResponse =
  | { ok: true; data: HotArticleItem[] }
  | { ok: false; error: string };

type PromptItem = {
  id: number;
  name: string;
  template: string;
  sortOrder: number;
};

type ArticleSource = "keyword" | "hot";

type CreateArticle = {
  source: ArticleSource;
  title: string;
  url: string;
  read: number;
  praise: number;
  looking: number;
  classify?: string;
  wx_name?: string;
  mpNickname?: string;
  wx_id?: string;
  short_link?: string;
  ghid?: string;
  publish_time?: number;
  publish_time_str?: string;
  [property: string]: unknown;
};

type HotArticleItem = {
  title: string;
  url: string;
  category: string;
  cover?: string;
  wxid?: string;
  mpNickname?: string;
  pubTime?: string;
  publishType?: string;
  position?: number;
  isOriginal?: string;
  readNum?: number;
  zanNum?: number;
  avg?: number;
  hot?: number;
  fans?: number;
};

type DraftItem = {
  id: string;
  title: string;
  content: string;
  status: "draft" | "ready";
  updatedAt: string;
  topic?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  promptId?: string;
  lastError?: string;
  publicationId?: string;
};

type RewriteStatus = {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  topic?: string;
};

const STORAGE_KEY = "create-articles-cache-v1";
const DRAFTS_KEY = "publish-items-v1";

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function getEngagement(article: CreateArticle) {
  const read = Number(article.read) || 0;
  const praise = Number(article.praise) || 0;
  const looking = Number(article.looking) || 0;
  if (read === 0) return 0;
  return (praise + looking) / read;
}

function stripScripts(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

function normalizeTopic(value?: string) {
  if (!value) return "";
  return value
    .replace(/[，。；;：:,.!?！]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function resolveTopic({
  rewriteTopic,
  article,
  keyword,
  fallbackTitle,
}: {
  rewriteTopic?: string;
  article?: CreateArticle | null;
  keyword?: string;
  fallbackTitle?: string;
}) {
  const manual = rewriteTopic?.trim();
  if (manual) return manual.slice(0, 24);
  return (
    normalizeTopic(article?.classify) ||
    normalizeTopic(keyword) ||
    normalizeTopic(fallbackTitle) ||
    "未分类"
  );
}

function dedupeArticles(items: CreateArticle[]) {
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

function toKeywordArticle(item: DajialaArticle): CreateArticle {
  return {
    source: "keyword",
    title: item.title,
    url: item.url,
    read: Number(item.read) || 0,
    praise: Number(item.praise) || 0,
    looking: Number(item.looking) || 0,
    classify: item.classify,
    wx_id: item.wx_id,
    short_link: item.short_link,
    ghid: item.ghid,
    publish_time: item.publish_time,
    publish_time_str: item.publish_time_str,
    ...item,
  };
}

function toHotArticle(item: HotArticleItem): CreateArticle {
  return {
    source: "hot",
    title: item.title,
    url: item.url,
    read: Number(item.readNum) || 0,
    praise: Number(item.zanNum) || 0,
    looking: 0,
    classify: item.category,
    wx_name: item.mpNickname,
    mpNickname: item.mpNickname,
    wx_id: item.wxid,
    short_link: item.url,
    publish_time_str: item.pubTime,
    publish_time: item.pubTime ? Date.parse(item.pubTime) : 0,
    ...item,
  };
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

function upsertDraft(item: DraftItem) {
  const list = loadDrafts();
  const sourceUrl = item.sourceUrl?.trim();
  const clearedItem = {
    ...item,
    lastError: undefined,
    publicationId: undefined,
  };
  if (!sourceUrl) {
    saveDrafts([clearedItem, ...list]);
    return clearedItem.id;
  }

  const index = list.findIndex((draft) => draft.sourceUrl === sourceUrl);
  if (index === -1) {
    saveDrafts([clearedItem, ...list]);
    return clearedItem.id;
  }

  const existing = list[index];
  const updated = { ...existing, ...clearedItem, id: existing.id };
  const next = [updated, ...list.filter((_, idx) => idx !== index)];
  saveDrafts(next);
  return existing.id;
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
  const [hotLoading, setHotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hotError, setHotError] = useState<string | null>(null);
  const [activeSource, setActiveSource] =
    useState<ArticleSource>("keyword");
  const [keywordArticles, setKeywordArticles] = useState<CreateArticle[]>([]);
  const [hotArticles, setHotArticles] = useState<CreateArticle[]>([]);
  const [articleCache, setArticleCache] = useState<
    Record<string, DajialaArticleHtmlData>
  >({});
  const [activeArticle, setActiveArticle] = useState<CreateArticle | null>(
    null
  );
  const [activeDetail, setActiveDetail] =
    useState<DajialaArticleHtmlData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [topic, setTopic] = useState("");
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteTarget, setRewriteTarget] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [batchRewriting, setBatchRewriting] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [rewriteStatus, setRewriteStatus] = useState<
    Record<string, RewriteStatus>
  >({});
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState<string | null>(null);
  const [promptSelections, setPromptSelections] = useState<
    Record<string, string>
  >({});

  const currentArticles = useMemo(
    () => (activeSource === "keyword" ? keywordArticles : hotArticles),
    [activeSource, keywordArticles, hotArticles]
  );

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as {
        keyword?: string;
        articles?: DajialaArticle[];
        keywordArticles?: CreateArticle[];
        activeSource?: ArticleSource;
        articleCache?: Record<string, DajialaArticleHtmlData>;
        activeUrl?: string;
      };
      setKeyword(parsed.keyword ?? "");
      const storedKeyword =
        parsed.keywordArticles ??
        (parsed.articles?.map(toKeywordArticle) ?? []);
      setKeywordArticles(storedKeyword);
      setArticleCache(parsed.articleCache ?? {});
      const source =
        parsed.activeSource === "hot" ? "hot" : "keyword";
      setActiveSource(source);
      if (source === "keyword" && parsed.activeUrl && storedKeyword) {
        const matched = storedKeyword.find(
          (item) => item.url === parsed.activeUrl
        );
        if (matched) {
          setActiveArticle(matched);
          setActiveDetail(parsed.articleCache?.[parsed.activeUrl] ?? null);
        }
      }
    } catch {
      setKeywordArticles([]);
    }
  }, []);

  useEffect(() => {
    const payload = {
      keyword,
      keywordArticles,
      articleCache,
      activeUrl: activeArticle?.url ?? "",
      activeSource,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [keyword, keywordArticles, articleCache, activeArticle, activeSource]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  useEffect(() => {
    if (!batchMessage) return;
    const timer = window.setTimeout(() => setBatchMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [batchMessage]);

  useEffect(() => {
    setSelectedUrls([]);
    setRewriteStatus({});
    setActiveArticle(null);
    setActiveDetail(null);
    setDetailError(null);
  }, [currentArticles, activeSource]);

  useEffect(() => {
    const loadPrompts = async () => {
      setPromptsLoading(true);
      setPromptsError(null);
      try {
        const res = await fetch("/api/prompts");
        const parsed = await readApiJson<PromptsApiResponse>(res, "提示词接口");
        if (!parsed.ok) {
          setPromptsError(parsed.error);
          return;
        }
        const data = parsed.data;
        if (!res.ok || !data.ok) {
          setPromptsError(!data.ok ? data.error : "获取提示词失败。");
          return;
        }
        setPrompts(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取提示词失败";
        setPromptsError(message);
      } finally {
        setPromptsLoading(false);
      }
    };

    loadPrompts();
  }, []);

  useEffect(() => {
    const loadHot = async () => {
      setHotLoading(true);
      setHotError(null);
      try {
        const res = await fetch("/api/hot-articles?category=17&limit=5");
        const parsed = await readApiJson<HotArticlesApiResponse>(
          res,
          "爆文接口"
        );
        if (!parsed.ok) {
          setHotError(parsed.error);
          return;
        }
        const data = parsed.data;
        if (!res.ok || !data.ok) {
          setHotError(!data.ok ? data.error : "获取爆文失败。");
          return;
        }
        const items = data.data.map(toHotArticle);
        setHotArticles(items);
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取爆文失败";
        setHotError(message);
      } finally {
        setHotLoading(false);
      }
    };

    loadHot();
  }, []);

  const activeHtml = useMemo(() => {
    if (!activeDetail?.html) return "";
    return stripScripts(activeDetail.html);
  }, [activeDetail]);

  const coverImage = useMemo(() => getFirstImage(markdown), [markdown]);
  const defaultPromptId = useMemo(
    () => (prompts[0]?.id ? String(prompts[0].id) : ""),
    [prompts]
  );

  useEffect(() => {
    if (!defaultPromptId || prompts.length === 0) return;
    const promptIds = new Set(prompts.map((prompt) => String(prompt.id)));

    setPromptSelections((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const article of currentArticles) {
        const current = next[article.url];
        if (!current || !promptIds.has(current)) {
          next[article.url] = defaultPromptId;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [currentArticles, defaultPromptId, prompts]);

  const requestArticleHtml = async (article: CreateArticle) => {
    const cached = articleCache[article.url];
    if (cached) return cached;

    const res = await fetch("/api/article-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: article.url }),
    });

    const parsed = await readApiJson<ArticleHtmlApiResponse>(res, "正文接口");
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    const data = parsed.data;
    if (!res.ok || !data.ok) {
      throw new Error(!data.ok ? data.error : "获取正文失败。");
    }

    if (!data.data?.data) {
      throw new Error("未获取到正文内容。");
    }

    const detail = data.data.data;
    setArticleCache((prev) => ({
      ...prev,
      [article.url]: detail,
    }));
    return detail;
  };

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
      const mapped = rawList.map(toKeywordArticle);
      const unique = dedupeArticles(mapped);
      setKeywordArticles(unique.slice(0, 5));
      setActiveSource("keyword");
    } catch (err) {
      const message = err instanceof Error ? err.message : "抓取失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotArticles = async () => {
    setHotLoading(true);
    setHotError(null);
    try {
      const res = await fetch("/api/hot-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: 17,
          limit: 5,
        }),
      });
      const parsed = await readApiJson<HotArticlesApiResponse>(
        res,
        "爆文接口"
      );
      if (!parsed.ok) {
        setHotError(parsed.error);
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setHotError(!data.ok ? data.error : "获取爆文失败。");
        return;
      }
      const items = data.data.map(toHotArticle);
      setHotArticles(items);
      setActiveSource("hot");
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取爆文失败";
      setHotError(message);
    } finally {
      setHotLoading(false);
    }
  };

  const loadArticleHtml = async (article: CreateArticle) => {
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
      const detail = await requestArticleHtml(article);
      setActiveDetail(detail);
      return detail;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取正文失败";
      setDetailError(message);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const rewriteArticle = async (
    article: CreateArticle,
    promptId?: string
  ) => {
    const detail = await requestArticleHtml(article);
    const sourceUrl = detail.article_url || article.url;
    const res = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: detail.title || article.title,
        html: detail.html,
        coverUrl: detail.cover_url,
        sourceUrl,
        promptId,
      }),
    });

    const parsed = await readApiJson<RewriteApiResponse>(res, "改写接口");
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    const data = parsed.data;
    if (!res.ok || !data.ok) {
      throw new Error(!data.ok ? data.error : "改写失败，请稍后再试。");
    }

    const draftTitle = data.data.title || detail.title || article.title;
    const draftContent = data.data.content || "";
    if (!draftContent.trim()) {
      throw new Error("未获取到改写内容。");
    }

    const draftTopic = resolveTopic({
      rewriteTopic: data.data.topic,
      article,
      keyword,
      fallbackTitle: draftTitle,
    });

    return {
      detail,
      title: draftTitle,
      content: draftContent,
      topic: draftTopic,
      sourceUrl,
    };
  };

  const handleRewrite = async (article: CreateArticle) => {
    setRewriteLoading(true);
    setRewriteTarget(article.url);
    setError(null);
    setRewriteStatus((prev) => ({
      ...prev,
      [article.url]: { status: "loading" },
    }));

    try {
      const promptId = promptSelections[article.url] || defaultPromptId;
      if (!promptId) {
        throw new Error("请先创建并选择提示词。");
      }
      await loadArticleHtml(article);
      const result = await rewriteArticle(article, promptId);

      setTitle(result.title);
      setMarkdown(result.content);
      setTopic(result.topic);

      const now = new Date().toISOString();
      const id = upsertDraft({
        id: crypto.randomUUID(),
        title: result.title,
        content: result.content,
        status: "ready",
        updatedAt: now,
        topic: result.topic,
        sourceTitle: article.title,
        sourceUrl: result.sourceUrl,
        promptId,
      });
      setDraftId(id);
      setSaveMessage("改写完成，已同步到发布管理");
      setRewriteStatus((prev) => ({
        ...prev,
        [article.url]: { status: "success", topic: result.topic },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "改写失败";
      setError(message);
      setRewriteStatus((prev) => ({
        ...prev,
        [article.url]: { status: "error", error: message },
      }));
    } finally {
      setRewriteLoading(false);
      setRewriteTarget(null);
    }
  };

  const handleSave = (status: "draft" | "ready") => {
    const trimmedTitle = title.trim() || activeArticle?.title || "未命名文章";
    const trimmedContent = markdown.trim();
    const resolvedTopic = resolveTopic({
      rewriteTopic: topic,
      article: activeArticle,
      keyword,
      fallbackTitle: trimmedTitle,
    });
    const selectedPromptId = activeArticle
      ? promptSelections[activeArticle.url] || defaultPromptId
      : defaultPromptId;

    if (!trimmedContent) {
      setError("请先生成或填写正文内容再保存。");
      return;
    }

    const now = new Date().toISOString();
    const payload: DraftItem = {
      id: draftId ?? crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      status,
      updatedAt: now,
      topic: resolvedTopic,
      sourceTitle: activeArticle?.title,
      sourceUrl: activeDetail?.article_url || activeArticle?.url,
      promptId: selectedPromptId,
    };

    if (draftId) {
      const list = loadDrafts();
      const next = list.some((item) => item.id === draftId)
        ? list.map((item) => (item.id === draftId ? payload : item))
        : [payload, ...list];
      saveDrafts(next);
      setDraftId(draftId);
    } else {
      const id = upsertDraft(payload);
      setDraftId(id);
    }
    setSaveMessage(status === "draft" ? "草稿已保存" : "已保存到发布管理");
  };

  const selectedArticles = useMemo(
    () => currentArticles.filter((article) => selectedUrls.includes(article.url)),
    [currentArticles, selectedUrls]
  );

  const toggleSelected = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handlePromptSelect = (url: string, promptId: string) => {
    setPromptSelections((prev) => ({ ...prev, [url]: promptId }));
  };

  const handleSelectAll = () => {
    setSelectedUrls(currentArticles.map((article) => article.url));
  };

  const handleClearSelection = () => {
    setSelectedUrls([]);
  };

  const handleBatchRewrite = async () => {
    if (selectedArticles.length === 0 || batchRewriting) return;

    setBatchRewriting(true);
    setBatchMessage(null);
    setError(null);

    let successCount = 0;
    let failureCount = 0;

    for (const article of selectedArticles) {
      setRewriteStatus((prev) => ({
        ...prev,
        [article.url]: { status: "loading" },
      }));

      try {
        const promptId = promptSelections[article.url] || defaultPromptId;
        if (!promptId) {
          throw new Error("请先创建并选择提示词。");
        }
        const result = await rewriteArticle(article, promptId);
        const now = new Date().toISOString();
        upsertDraft({
          id: crypto.randomUUID(),
          title: result.title,
          content: result.content,
          status: "ready",
          updatedAt: now,
          topic: result.topic,
          sourceTitle: article.title,
          sourceUrl: result.sourceUrl,
          promptId,
        });

        successCount += 1;
        setRewriteStatus((prev) => ({
          ...prev,
          [article.url]: { status: "success", topic: result.topic },
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "改写失败";
        failureCount += 1;
        setRewriteStatus((prev) => ({
          ...prev,
          [article.url]: { status: "error", error: message },
        }));
      }
    }

    if (successCount > 0) {
      setBatchMessage(
        `已同步 ${successCount} 篇到发布管理${
          failureCount ? `，失败 ${failureCount} 篇` : ""
        }`
      );
      setSelectedUrls([]);
    } else if (failureCount > 0) {
      setBatchMessage(`改写失败 ${failureCount} 篇`);
    }

    setBatchRewriting(false);
  };

  const isBusy = rewriteLoading || batchRewriting;

  return (
    <div className="space-y-8">
      <PageHeader
        title="内容创作"
        description="输入关键词抓取公众号文章，一键改写为 Markdown 并保存到发布管理。"
        badge="创作工作台"
      />

      <Card className="border-border/60 bg-white/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">提示词</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              改写时可为每篇文章选择提示词，统一格式已固定，默认使用第一个提示词。
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/prompts">管理提示词</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {promptsError ? (
            <p className="text-xs text-rose-600">{promptsError}</p>
          ) : null}
          {promptsLoading ? (
            <div className="text-xs text-muted-foreground">提示词加载中...</div>
          ) : prompts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-white/60 p-3 text-xs text-muted-foreground">
              暂无提示词，请先在“提示词”页面创建。
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt, index) => (
                <Badge
                  key={prompt.id}
                  variant={index === 0 ? "secondary" : "outline"}
                  className="rounded-full"
                >
                  {prompt.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">选题来源</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={activeSource === "keyword" ? "default" : "outline"}
                className="h-7 rounded-full"
                onClick={() => setActiveSource("keyword")}
              >
                关键词抓取
              </Button>
              <Button
                size="sm"
                variant={activeSource === "hot" ? "default" : "outline"}
                className="h-7 rounded-full"
                onClick={() => setActiveSource("hot")}
              >
                健康爆文
              </Button>
            </div>

            {activeSource === "keyword" ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入关键词，例如：冬虫夏草"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                  <Button
                    className="rounded-full"
                    onClick={fetchArticles}
                    disabled={isLoading || isBusy}
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
                {error ? (
                  <p className="text-xs text-rose-600">{error}</p>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button
                    className="rounded-full"
                    onClick={fetchHotArticles}
                    disabled={hotLoading || isBusy}
                  >
                    {hotLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "抓取健康爆文"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  默认抓取 5 篇，分类：健康。
                </p>
                {hotError ? (
                  <p className="text-xs text-rose-600">{hotError}</p>
                ) : null}
              </>
            )}
            {currentArticles.length > 0 ? (
              <div className="rounded-xl border border-border/60 bg-white/60 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    已选 {selectedUrls.length} / {currentArticles.length} 篇
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full"
                      onClick={handleSelectAll}
                      disabled={batchRewriting}
                    >
                      全选
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full"
                      onClick={handleClearSelection}
                      disabled={selectedUrls.length === 0 || batchRewriting}
                    >
                      清空
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 rounded-full"
                      onClick={handleBatchRewrite}
                      disabled={selectedUrls.length === 0 || batchRewriting}
                    >
                      {batchRewriting ? "批量改写中..." : "批量改写并同步"}
                    </Button>
                  </div>
                </div>
                {batchMessage ? (
                  <div className="mt-2 text-xs text-emerald-600">
                    {batchMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-3">
              {currentArticles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-white/60 p-4 text-xs text-muted-foreground">
                  {activeSource === "keyword"
                    ? "暂无数据，输入关键词后点击“抓取”。"
                    : "暂无数据，点击“抓取健康爆文”。"}
                </div>
              ) : (
                currentArticles.map((article) => {
                  const status = rewriteStatus[article.url];
                  const isSelected = selectedUrls.includes(article.url);
                  const isRewriting =
                    status?.status === "loading" ||
                    (rewriteLoading && rewriteTarget === article.url);
                  const promptValue =
                    promptSelections[article.url] || defaultPromptId;
                  return (
                    <div
                      key={`${article.wx_id}-${article.short_link}`}
                      className={`rounded-xl border border-border/60 bg-white/70 p-3 transition ${
                        activeArticle?.url === article.url
                          ? "border-foreground"
                          : "hover:border-foreground"
                      } ${isSelected ? "ring-1 ring-foreground/20" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-medium line-clamp-2">
                          {article.title}
                        </div>
                        <input
                          type="checkbox"
                          aria-label="选择文章"
                          checked={isSelected}
                          onChange={() => toggleSelected(article.url)}
                          disabled={batchRewriting}
                          className="mt-1 h-4 w-4 accent-foreground"
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>阅读 {formatCompact(Number(article.read))}</span>
                        <span>点赞 {formatCompact(Number(article.praise))}</span>
                        <span>在看 {formatCompact(Number(article.looking))}</span>
                        <Badge variant="outline" className="rounded-full">
                          互动率 {(getEngagement(article) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <span className="text-xs text-muted-foreground">
                          提示词
                        </span>
                        <Select
                          value={promptValue}
                          onValueChange={(value) =>
                            handlePromptSelect(article.url, value)
                          }
                          disabled={
                            promptsLoading ||
                            prompts.length === 0 ||
                            batchRewriting
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="选择提示词" />
                          </SelectTrigger>
                          <SelectContent>
                            {prompts.length === 0 ? (
                              <SelectItem value="none" disabled>
                                暂无提示词
                              </SelectItem>
                            ) : (
                              prompts.map((prompt) => (
                                <SelectItem
                                  key={prompt.id}
                                  value={String(prompt.id)}
                                >
                                  {prompt.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
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
                          disabled={rewriteLoading || batchRewriting}
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
                      {status?.status === "success" ? (
                        <div className="mt-2 text-xs text-emerald-600">
                          已改写并同步{status.topic ? ` · ${status.topic}` : ""}
                        </div>
                      ) : null}
                      {status?.status === "error" ? (
                        <div className="mt-2 text-xs text-rose-600">
                          {status.error}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">正文预览</p>
                {activeArticle?.wx_name || activeArticle?.mpNickname || activeArticle?.wx_id ? (
                  <Badge variant="secondary" className="rounded-full">
                    {activeArticle.wx_name ||
                      activeArticle.mpNickname ||
                      activeArticle.wx_id}
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
            <Input
              className="mt-2"
              placeholder="主题（可手动修改）"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />

            {coverImage ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
                <img src={coverImage} alt="封面" className="w-full" />
              </div>
            ) : null}

            <Tabs defaultValue="edit" className="mt-5">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
                {rewriteLoading ? (
                  <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    改写中...
                  </div>
                ) : null}
              </div>
              <TabsContent value="edit" className="mt-4">
                <Textarea
                  className="min-h-[500px] resize-none"
                  placeholder="请输入 Markdown 内容，支持标题、列表、引用等格式。"
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="min-h-[500px] rounded-xl border border-border/60 bg-white/70 p-4">
                  {markdown ? (
                    <div className="prose prose-neutral max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex h-[468px] items-center justify-center text-sm text-muted-foreground">
                      预览区域：改写完成后可查看排版预览。
                    </div>
                  )}
                </div>
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
