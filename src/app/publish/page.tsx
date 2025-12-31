"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Link2,
  MoreHorizontal,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { readJson } from "@/lib/http";

type DraftItem = {
  id: string;
  title: string;
  content: string;
  status: "draft" | "ready" | "publishing" | "published" | "failed";
  updatedAt: string;
  sourceTitle?: string;
  sourceUrl?: string;
  lastError?: string;
  publicationId?: string;
};

type WechatAccount = {
  name: string;
  wechatAppid: string;
  username: string;
  avatar: string;
  type: "subscription" | "service" | string;
  verified: boolean;
  status: "active" | "revoked" | string;
  lastAuthTime: string;
  createdAt: string;
};

const DRAFTS_KEY = "publish-items-v1";
const WECHAT_KEY = "wechat-accounts-cache-v1";
const DEFAULT_APPID_KEY = "wechat-default-appid-v1";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  scheduled: { label: "定时中", variant: "secondary" },
  draft: { label: "草稿", variant: "outline" },
  ready: { label: "待发布", variant: "secondary" },
  publishing: { label: "发布中", variant: "default" },
  published: { label: "已发布", variant: "secondary" },
  failed: { label: "失败", variant: "outline" },
};

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <CalendarClock className="h-4 w-4 text-amber-600" />,
  draft: <Clock3 className="h-4 w-4 text-muted-foreground" />,
  ready: <CalendarClock className="h-4 w-4 text-emerald-600" />,
  publishing: <Send className="h-4 w-4 text-foreground" />,
  published: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  failed: <XCircle className="h-4 w-4 text-rose-600" />,
};

function loadDrafts(): DraftItem[] {
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

function loadWechatAccounts(): WechatAccount[] {
  const cached = localStorage.getItem(WECHAT_KEY);
  if (!cached) return [];
  try {
    const parsed = JSON.parse(cached) as WechatAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWechatAccounts(list: WechatAccount[]) {
  localStorage.setItem(WECHAT_KEY, JSON.stringify(list));
}

function formatDateTime(value: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[#>*_`~>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSummary(markdown: string) {
  const text = stripMarkdown(markdown);
  return text.slice(0, 120);
}

function extractImages(markdown: string) {
  const matches = Array.from(markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g));
  return matches.map((match) => match[1]).filter(Boolean);
}

function buildNewspicContent(markdown: string) {
  const images = extractImages(markdown).slice(0, 20);
  const text = stripMarkdown(markdown).slice(0, 1000);
  const imageBlock = images
    .map((url, index) => `![图片${index + 1}](${url})`)
    .join("\n");
  return `${text}\n\n${imageBlock}`.trim();
}

export default function PublishPage() {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [accounts, setAccounts] = useState<WechatAccount[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedAppid, setSelectedAppid] = useState("");
  const [publishLoadingId, setPublishLoadingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [failedItem, setFailedItem] = useState<DraftItem | null>(null);
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  useEffect(() => {
    setItems(loadDrafts());
    const loadedAccounts = loadWechatAccounts();
    setAccounts(loadedAccounts);
    setSelectedAppid(localStorage.getItem(DEFAULT_APPID_KEY) || "");
  }, []);

  const handleRefresh = () => {
    setItems(loadDrafts());
  };

  const handleSelectAccount = (appid: string) => {
    setSelectedAppid(appid);
    localStorage.setItem(DEFAULT_APPID_KEY, appid);
  };

  const handleSyncWechat = async () => {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/wechat-accounts", { method: "POST" });
      const parsed = await readApiJson<{
        ok: boolean;
        data?: { data?: { accounts?: WechatAccount[] } };
        error?: string;
      }>(res, "同步接口");
      if (!parsed.ok) {
        setSyncError(parsed.error);
        return;
      }

      const data = parsed.data;

      if (!res.ok || !data.ok) {
        setSyncError(data.error || "同步失败，请稍后再试。");
        return;
      }

      const list = data.data?.data?.accounts ?? [];
      setAccounts(list);
      saveWechatAccounts(list);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "同步失败，请稍后再试。";
      setSyncError(message);
    } finally {
      setSyncLoading(false);
    }
  };

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      );
      saveDrafts(next);
      return next;
    });
  };

  const handleShowError = (item: DraftItem) => {
    setFailedItem(item);
    setShowErrorSheet(true);
  };

  const handlePublish = async (item: DraftItem, articleType: "news" | "newspic") => {
    if (!selectedAppid) {
      setPublishError("请先同步并选择公众号账号。");
      return;
    }

    setPublishLoadingId(item.id);
    setPublishError(null);
    updateItem(item.id, { status: "publishing", lastError: undefined });

    const coverImage = extractImages(item.content)[0];
    const summary = extractSummary(item.content);
    const payloadContent =
      articleType === "newspic"
        ? buildNewspicContent(item.content)
        : item.content;

    try {
      const res = await fetch("/api/wechat-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wechatAppid: selectedAppid,
          title: item.title.slice(0, 64),
          content: payloadContent,
          summary,
          coverImage,
          contentFormat: "markdown",
          articleType,
        }),
      });

      const parsed = await readApiJson<{
        ok: boolean;
        data?: { data?: { publicationId?: string } };
        error?: string;
      }>(res, "发布接口");
      if (!parsed.ok) {
        updateItem(item.id, {
          status: "failed",
          lastError: parsed.error,
        });
        return;
      }

      const data = parsed.data;

      if (!res.ok || !data.ok) {
        updateItem(item.id, {
          status: "failed",
          lastError: data.error || "发布失败，请稍后再试。",
        });
        return;
      }

      updateItem(item.id, {
        status: "published",
        publicationId: data.data?.data?.publicationId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "发布失败，请稍后再试。";
      updateItem(item.id, { status: "failed", lastError: message });
    } finally {
      setPublishLoadingId(null);
    }
  };

  const rows = useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      time: item.status === "ready" ? "待定时" : "未设置",
      updated: formatDateTime(item.updatedAt),
      lastError: item.lastError,
    }));
  }, [items]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="发布管理"
        description="管理 AI 生成文章的发布节奏，保存的草稿会自动出现在这里。"
        badge="公众号发布"
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        }
      />

      <Card className="border-border/60 bg-white/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              公众号授权列表
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              点击同步获取已授权公众号账号信息。
            </p>
          </div>
          <Button
            className="rounded-full"
            onClick={handleSyncWechat}
            disabled={syncLoading}
          >
            {syncLoading ? "同步中..." : "一键同步公众号"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncError ? (
            <p className="text-sm text-rose-600">{syncError}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedAppid} onValueChange={handleSelectAccount}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="选择要发布的公众号" />
              </SelectTrigger>
              <SelectContent>
                {accounts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    暂无账号
                  </SelectItem>
                ) : (
                  accounts.map((account) => (
                    <SelectItem
                      key={account.wechatAppid}
                      value={account.wechatAppid}
                    >
                      {account.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedAppid ? (
              <Badge variant="secondary" className="rounded-full">
                默认发布账号已选
              </Badge>
            ) : null}
          </div>
          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-white/60 p-4 text-sm text-muted-foreground">
              暂无公众号数据，请点击“同步公众号”。
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {accounts.map((account) => (
                <div
                  key={`${account.wechatAppid}-${account.username}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/70 p-3"
                >
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="h-12 w-12 rounded-full border border-border/60 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {account.name}
                      </span>
                      {account.verified ? (
                        <Badge variant="secondary" className="rounded-full">
                          已认证
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {account.type === "service" ? "服务号" : "订阅号"} · {" "}
                      {account.status === "active" ? "正常" : "已解绑"}
                    </div>
                  </div>
                  <Button
                    variant={
                      selectedAppid === account.wechatAppid
                        ? "default"
                        : "ghost"
                    }
                    size="icon"
                    onClick={() => handleSelectAccount(account.wechatAppid)}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-white/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">筛选与操作</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input placeholder="搜索标题或关键词" />
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="ready">待发布</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="wechat">
            <SelectTrigger>
              <SelectValue placeholder="渠道" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wechat">公众号</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="today">
            <SelectTrigger>
              <SelectValue placeholder="时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </CardContent>
      </Card>

      {publishError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {publishError}
        </div>
      ) : null}

      <Card className="border-border/60 bg-white/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">文章列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>定时</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    暂无保存内容，请先在“内容创作”保存草稿。
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((item) => {
                  const status = statusMap[item.status];
                  const loading = publishLoadingId === item.id;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{item.title}</div>
                        {item.lastError ? (
                          <div className="mt-1 text-xs text-rose-600">
                            {item.lastError}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[item.status]}
                          <Badge variant={status.variant} className="rounded-full">
                            {status.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell>{item.updated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() =>
                                handleShowError(items.find((row) => row.id === item.id)!)
                              }
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              查看失败原因
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>编辑文章</DropdownMenuItem>
                              <DropdownMenuItem>预览排版</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={loading}
                                onClick={() =>
                                  handlePublish(items.find((row) => row.id === item.id)!, "news")
                                }
                              >
                                <Send className="mr-2 h-4 w-4" />
                                发布公众号
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={loading}
                                onClick={() =>
                                  handlePublish(items.find((row) => row.id === item.id)!, "newspic")
                                }
                              >
                                <Sparkles className="mr-2 h-4 w-4" />
                                发布小绿书
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>设置定时</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 失败原因弹窗 */}
      <Sheet open={showErrorSheet} onOpenChange={setShowErrorSheet}>
        <SheetContent className="w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600" />
              发布失败详情
            </SheetTitle>
            <SheetDescription>
              查看文章发布失败的具体原因和解决建议
            </SheetDescription>
          </SheetHeader>

          {failedItem && (
            <div className="mt-6 space-y-6">
              {/* 文章信息 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  文章标题
                </label>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-sm">{failedItem.title}</p>
                </div>
              </div>

              {/* 失败原因 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  错误信息
                </label>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">
                    {failedItem.lastError || "未知错误"}
                  </p>
                </div>
              </div>

              {/* 可能原因 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  可能的原因
                </label>
                <div className="rounded-lg border border-border bg-white p-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500">•</span>
                      <span>公众号授权已过期，请重新授权</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500">•</span>
                      <span>文章内容包含违规词汇或格式不支持</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500">•</span>
                      <span>网络连接超时或API服务异常</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500">•</span>
                      <span>封面图片链接失效或格式不支持</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 解决方案 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  建议操作
                </label>
                <div className="rounded-lg border border-border bg-white p-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">1.</span>
                      <span>检查公众号授权状态，点击"一键同步公众号"重新授权</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">2.</span>
                      <span>检查文章内容格式和封面图片是否正确</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">3.</span>
                      <span>稍后重试发布操作</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowErrorSheet(false)}
                >
                  关闭
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowErrorSheet(false);
                    handlePublish(failedItem, "news");
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试发布
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
