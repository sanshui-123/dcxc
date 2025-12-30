import {
  ArrowUpRight,
  CalendarClock,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    label: "今日抓取",
    value: "42 篇",
    delta: "+12%",
    icon: Layers,
  },
  {
    label: "待发布",
    value: "6 篇",
    delta: "3 篇已定时",
    icon: CalendarClock,
  },
  {
    label: "本周互动率",
    value: "6.8%",
    delta: "高于均值",
    icon: TrendingUp,
  },
  {
    label: "热度飙升",
    value: "3 个",
    delta: "健康科普",
    icon: Flame,
  },
];

const tasks = [
  {
    title: "关键词：免疫力提升",
    progress: 68,
    status: "抓取 + 概要中",
  },
  {
    title: "关键词：中药食疗",
    progress: 42,
    status: "洞察生成中",
  },
  {
    title: "关键词：睡眠修复",
    progress: 90,
    status: "报告即将完成",
  },
];

const releases = [
  {
    title: "三伏养生的五个误区",
    time: "今日 08:00",
    status: "定时发布",
  },
  {
    title: "换季时的补气节奏",
    time: "明日 08:00",
    status: "待确认",
  },
  {
    title: "高互动率标题模板拆解",
    time: "周五 08:00",
    status: "草稿",
  },
];

const insights = [
  "高互动话题集中在“可执行方法”而非“概念科普”。",
  "“一周方案”类标题更容易触发收藏。",
  "午后时段阅读峰值，但互动集中在早晨 8:00。",
];

export default function Home() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="概览"
        description="监控选题抓取、AI生成与发布节奏，把内容工厂节拍固定在每天早上 08:00。"
        badge="内容工厂 Agent"
        actions={
          <>
            <Button variant="outline" className="rounded-full">
              <Sparkles className="mr-2 h-4 w-4" />
              快速生成
            </Button>
            <Button className="rounded-full">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              查看发布队列
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/60 bg-white/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="rounded-full border border-border/60 bg-white p-2">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.delta}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              选题分析进度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{task.title}</span>
                  <Badge variant="secondary" className="rounded-full">
                    {task.status}
                  </Badge>
                </div>
                <Progress
                  value={task.progress}
                  className="mt-3 h-2 bg-white/80"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              发布节奏
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {releases.map((release) => (
              <div key={release.title} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                <div>
                  <p className="text-sm font-medium">{release.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {release.time} · {release.status}
                  </p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="rounded-2xl border border-dashed border-border/70 bg-white/60 p-4">
              <p className="text-sm font-medium">今日重点洞察</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
