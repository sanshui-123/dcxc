"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { readJson } from "@/lib/http";
import { DEFAULT_PROMPT_TEMPLATE } from "@/lib/prompts";

type PromptItem = {
  id: number;
  name: string;
  template: string;
  sortOrder: number;
};

type PromptsApiResponse =
  | { ok: true; data: PromptItem[] }
  | { ok: false; error: string };

type AutoSaveState = "idle" | "saving" | "saved" | "error";

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

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [autoSaveState, setAutoSaveState] = useState<
    Record<number, AutoSaveState>
  >({});
  const [expandedPrompts, setExpandedPrompts] = useState<Record<number, boolean>>({});
  const promptsRef = useRef<PromptItem[]>([]);
  const autosaveTimers = useRef<Record<number, number>>({});
  const autosaveResetTimers = useRef<Record<number, number>>({});

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prompts");
      const parsed = await readApiJson<PromptsApiResponse>(res, "提示词接口");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "获取提示词失败。");
        return;
      }
      setPrompts(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取提示词失败";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    promptsRef.current = prompts;
  }, [prompts]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    return () => {
      Object.values(autosaveTimers.current).forEach((timer) =>
        window.clearTimeout(timer)
      );
      Object.values(autosaveResetTimers.current).forEach((timer) =>
        window.clearTimeout(timer)
      );
    };
  }, []);

  const markAutoSaveState = (id: number, state: AutoSaveState) => {
    setAutoSaveState((prev) => ({ ...prev, [id]: state }));
    if (state === "saved") {
      const existing = autosaveResetTimers.current[id];
      if (existing) window.clearTimeout(existing);
      autosaveResetTimers.current[id] = window.setTimeout(() => {
        setAutoSaveState((prev) => ({ ...prev, [id]: "idle" }));
      }, 1600);
    }
  };

  const savePrompt = async (prompt: PromptItem, mode: "manual" | "auto") => {
    if (mode === "manual") {
      setSavingId(prompt.id);
    } else {
      markAutoSaveState(prompt.id, "saving");
    }
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prompt.name,
          template: prompt.template,
        }),
      });
      const parsed = await readApiJson<
        | { ok: true; data: PromptItem }
        | { ok: false; error: string }
      >(res, "更新提示词");
      if (!parsed.ok) {
        setError(parsed.error);
        if (mode === "auto") markAutoSaveState(prompt.id, "error");
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "更新提示词失败。");
        if (mode === "auto") markAutoSaveState(prompt.id, "error");
        return;
      }
      setPrompts((prev) =>
        prev.map((item) => (item.id === prompt.id ? data.data : item))
      );
      if (mode === "manual") {
        setMessage("提示词已保存");
      } else {
        markAutoSaveState(prompt.id, "saved");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新提示词失败";
      setError(errorMessage);
      if (mode === "auto") markAutoSaveState(prompt.id, "error");
    } finally {
      if (mode === "manual") {
        setSavingId(null);
      }
    }
  };

  const scheduleAutoSave = (id: number) => {
    const existing = autosaveTimers.current[id];
    if (existing) window.clearTimeout(existing);
    autosaveTimers.current[id] = window.setTimeout(() => {
      const prompt = promptsRef.current.find((item) => item.id === id);
      if (!prompt) return;
      savePrompt(prompt, "auto");
    }, 800);
  };

  const updatePrompt = (id: number, patch: Partial<PromptItem>) => {
    setPrompts((prev) =>
      prev.map((prompt) => (prompt.id === id ? { ...prompt, ...patch } : prompt))
    );
    scheduleAutoSave(id);
  };

  const handleCreate = async () => {
    setError(null);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `新提示词 ${prompts.length + 1}`,
          template: DEFAULT_PROMPT_TEMPLATE,
        }),
      });
      const parsed = await readApiJson<
        | { ok: true; data: PromptItem }
        | { ok: false; error: string }
      >(res, "创建提示词");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "创建提示词失败。");
        return;
      }
      setPrompts((prev) => [...prev, data.data]);
      setMessage("提示词已创建");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建提示词失败";
      setError(errorMessage);
    }
  };

  const handleSave = async (prompt: PromptItem) => {
    await savePrompt(prompt, "manual");
  };

  const handleDelete = async (promptId: number) => {
    if (prompts.length <= 1) return;
    setDeletingId(promptId);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      });
      const parsed = await readApiJson<
        | { ok: true }
        | { ok: false; error: string }
      >(res, "删除提示词");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "删除提示词失败。");
        return;
      }
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
      setMessage("提示词已删除");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除提示词失败";
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (promptId: number, direction: "up" | "down") => {
    setMovingId(promptId);
    setError(null);
    try {
      const res = await fetch("/api/prompts/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promptId, direction }),
      });
      const parsed = await readApiJson<
        | { ok: true; data?: { moved?: boolean } }
        | { ok: false; error: string }
      >(res, "移动提示词");
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const data = parsed.data;
      if (!res.ok || !data.ok) {
        setError(!data.ok ? data.error : "移动提示词失败。");
        return;
      }
      await fetchPrompts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "移动提示词失败";
      setError(errorMessage);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="提示词"
        description="管理改写提示词模板，可按需新增、调整顺序或在线编辑。"
        badge="提示词中心"
        actions={
          <Button className="rounded-full" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建提示词
          </Button>
        }
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载提示词...
        </div>
      ) : null}

      <div className="space-y-4">
        {prompts.length === 0 ? (
          <Card className="border-border/60 bg-white/70">
            <CardContent className="p-6 text-sm text-muted-foreground">
              暂无提示词，请点击“新建提示词”创建。
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt, index) => {
            const isSaving = savingId === prompt.id;
            const isMoving = movingId === prompt.id;
            const isDeleting = deletingId === prompt.id;
            const isFirst = index === 0;
            const isLast = index === prompts.length - 1;

            return (
              <Card key={prompt.id} className="border-border/60 bg-white/70">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-base font-semibold">
                      <Input
                        value={prompt.name}
                        onChange={(event) =>
                          updatePrompt(prompt.id, { name: event.target.value })
                        }
                        className="h-9"
                      />
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">
                        顺序 {index + 1}
                      </Badge>
                      {index === 0 ? (
                        <Badge variant="secondary" className="rounded-full">
                          默认提示词
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {autoSaveState[prompt.id] === "saving" && (
                      <span className="text-xs text-muted-foreground">
                        自动保存中...
                      </span>
                    )}
                    {autoSaveState[prompt.id] === "saved" && (
                      <span className="text-xs text-emerald-600">
                        已自动保存
                      </span>
                    )}
                    {autoSaveState[prompt.id] === "error" && (
                      <span className="text-xs text-rose-600">
                        自动保存失败
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleMove(prompt.id, "up")}
                      disabled={isFirst || isMoving}
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      上移
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleMove(prompt.id, "down")}
                      disabled={isLast || isMoving}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      下移
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleSave(prompt)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      保存
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={prompts.length <= 1 || isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    这里只填写自定义改写要求，系统会自动追加统一格式（JSON +
                    图片占位符 + 原文占位符）。
                  </p>

                  {/* 折叠/展开控制 */}
                  <div className="space-y-2">
                    {!expandedPrompts[prompt.id] ? (
                      /* 预览模式 */
                      <div
                        className="relative min-h-[60px] rounded-lg border border-border/60 bg-muted/30 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() =>
                          setExpandedPrompts((prev) => ({
                            ...prev,
                            [prompt.id]: true,
                          }))
                        }
                      >
                        <p className="pr-8 text-sm text-muted-foreground line-clamp-3">
                          {prompt.template || "暂无内容"}
                        </p>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                          <span>点击展开</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      /* 编辑模式 */
                      <div className="space-y-2">
                        <Textarea
                          className="min-h-[220px]"
                          value={prompt.template}
                          onChange={(event) =>
                            updatePrompt(prompt.id, {
                              template: event.target.value,
                            })
                          }
                        />
                        <button
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() =>
                            setExpandedPrompts((prev) => ({
                              ...prev,
                              [prompt.id]: false,
                            }))
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                          收起
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    （高级）如需手动编排，可使用占位符：
                    {"{{title}}、{{sourceUrl}}、{{html}}"}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
