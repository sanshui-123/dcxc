import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  Zap,
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
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
    ringColor: "ring-amber-500/20",
  },
  {
    label: "待发布",
    value: "6 篇",
    delta: "3 篇已定时",
    icon: CalendarClock,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    ringColor: "ring-emerald-500/20",
  },
  {
    label: "本周互动率",
    value: "6.8%",
    delta: "高于均值",
    icon: TrendingUp,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    ringColor: "ring-blue-500/20",
  },
  {
    label: "热度飙升",
    value: "3 个",
    delta: "健康科普",
    icon: Flame,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-rose-50 via-white to-pink-50",
    ringColor: "ring-rose-500/20",
  },
];

const tasks = [
  {
    title: "关键词：免疫力提升",
    progress: 68,
    status: "抓取 + 概要中",
    color: "from-amber-400 to-amber-600",
    icon: Zap,
    bgColor: "bg-amber-50",
  },
  {
    title: "关键词：中药食疗",
    progress: 42,
    status: "洞察生成中",
    color: "from-emerald-400 to-emerald-600",
    icon: Activity,
    bgColor: "bg-emerald-50",
  },
  {
    title: "关键词：睡眠修复",
    progress: 90,
    status: "报告即将完成",
    color: "from-blue-400 to-blue-600",
    icon: CheckCircle2,
    bgColor: "bg-blue-50",
  },
];

const releases = [
  {
    title: "三伏养生的五个误区",
    time: "今日 08:00",
    status: "定时发布",
    statusColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  {
    title: "换季时的补气节奏",
    time: "明日 08:00",
    status: "待确认",
    statusColor: "text-amber-700 bg-amber-100 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    title: "高互动率标题模板拆解",
    time: "周五 08:00",
    status: "草稿",
    statusColor: "text-slate-600 bg-slate-100 border-slate-200",
    dotColor: "bg-slate-400",
  },
];

const insights = [
  { icon: "📈", text: '高互动话题集中在"可执行方法"而非"概念科普"' },
  { icon: "📌", text: '"一周方案"类标题更容易触发收藏' },
  { icon: "⏰", text: "午后时段阅读峰值，但互动集中在早晨 8:00" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="概览"
        description="监控选题抓取、AI生成与发布节奏，把内容工厂节拍固定在每天早上 08:00。"
        badge="内容工厂 Agent"
        actions={
          <>
            <Button variant="outline" className="rounded-full border-2 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              快速生成
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-foreground to-foreground/90 shadow-lg shadow-foreground/20">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              查看发布队列
            </Button>
          </>
        }
      />

      {/* 统计卡片 - 增强视觉效果 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${stat.bgColor} animate-fadeInUp`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 动态背景装饰 */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-black/5 to-transparent rounded-full" />

              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-xl p-2.5 ${stat.ringColor} ring-4 bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className={`h-4 w-4 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-black tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded-full bg-white/80 backdrop-blur px-2.5 text-xs font-semibold shadow-sm">
                    {stat.delta}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 选题分析进度 + 发布节奏 */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 进度卡片 - 全新设计 */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-100 via-white to-slate-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">选题分析进度</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">实时跟踪 AI 处理状态</p>
              </div>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {tasks.map((task, index) => {
              const TaskIcon = task.icon;
              return (
                <div
                  key={task.title}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-border/50 p-4 transition-all hover:shadow-lg hover:border-border animate-fadeInUp"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${task.color}`} />
                  <div className={`absolute right-0 top-0 w-20 h-20 bg-gradient-to-bl ${task.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity`} />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${task.bgColor}`}>
                        <TaskIcon className={`h-4 w-4 bg-gradient-to-br ${task.color} bg-clip-text text-transparent`} />
                      </div>
                      <span className="text-sm font-semibold">{task.title}</span>
                    </div>
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={task.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>处理进度</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 发布节奏卡片 */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-100 via-white to-slate-50 px-6 py-5">
            <CardTitle className="text-base font-bold">发布节奏</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">每日 08:00 自动发布</p>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* 时间线 */}
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-slate-300" />
              {releases.map((release, index) => (
                <div
                  key={release.title}
                  className="relative flex items-start gap-4 group py-2"
                >
                  <div className={`mt-1.5 h-4 w-4 rounded-full border-4 border-white shadow-sm z-10 ${release.dotColor} group-hover:scale-125 transition-transform`} />
                  <div className="flex-1 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition">
                    <p className="text-sm font-medium">{release.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{release.time}</span>
                      <span>·</span>
                      <span className={`px-2 py-0.5 rounded-full border ${release.statusColor}`}>
                        {release.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            {/* 洞察卡片 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-white to-rose-50 border-2 border-dashed border-amber-200 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-rose-200/20 to-transparent rounded-full blur-xl" />

              <p className="relative text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                今日重点洞察
              </p>
              <ul className="relative mt-4 space-y-3">
                {insights.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-muted-foreground group/item"
                  >
                    <span className="text-lg group-hover/item:scale-125 transition-transform">{item.icon}</span>
                    <span className="group-hover/item:text-foreground transition-colors">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
