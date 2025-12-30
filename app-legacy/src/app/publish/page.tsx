"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

type ArticleStatus = "published" | "draft" | "scheduled";

interface Article {
  id: number;
  title: string;
  status: ArticleStatus;
  views: number;
  date: string;
}

const articles: Article[] = [
  { id: 1, title: "2024年冬虫夏草市场行情深度解析", status: "published", views: 12450, date: "2024-10-24" },
  { id: 2, title: "如何辨别那曲虫草与玉树虫草？", status: "published", views: 8900, date: "2024-10-22" },
  { id: 3, title: "虫草炖鸡的正确做法与禁忌", status: "draft", views: 0, date: "2024-10-20" },
  { id: 4, title: "鲜虫草与干虫草的营养价值对比", status: "scheduled", views: 0, date: "2024-10-28" },
  { id: 5, title: "冬虫夏草的食用时间与注意事项", status: "draft", views: 0, date: "2024-10-18" },
];

export default function PublishPage() {
  const [filter, setFilter] = useState<ArticleStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: ArticleStatus) => {
    const badges = {
      published: <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">已发布</span>,
      draft: <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">草稿</span>,
      scheduled: <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">定时</span>,
    };
    return badges[status];
  };

  const filteredArticles = articles.filter((article) => {
    const matchesFilter = filter === "all" || article.status === filter;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout title="发布管理">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  filter === f
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "全部" : f === "published" ? "已发布" : "草稿"}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"></i>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">文章标题</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">阅读量</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">发布时间</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/50 transition">
                  <td className="px-4 py-3">
                    <span className="font-medium">{article.title}</span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(article.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.status === "published" ? article.views.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{article.date}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition mr-2">
                      <i className="fa-solid fa-pen h-4 w-4"></i>
                    </button>
                    <button className="text-muted-foreground hover:text-destructive transition">
                      <i className="fa-solid fa-trash h-4 w-4"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">共 {filteredArticles.length} 篇文章</span>
            <div className="flex gap-1">
              <button className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
