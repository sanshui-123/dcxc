import {
  BarChart3,
  Cloud,
  Filter,
  Play,
  Target,
  ThumbsUp,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

const topLikes = [
  { title: "三伏天最容易忽略的三类症状", likes: "2.1k" },
  { title: "女性补气的时间表", likes: "1.9k" },
  { title: "胃寒人群的夏季调理", likes: "1.7k" },
  { title: "办公室久坐的三种自救法", likes: "1.4k" },
  { title: "睡眠修复的晚间流程", likes: "1.2k" },
];

const topEngagement = [
  { title: "一周内提升睡眠质量", rate: "12.4%" },
  { title: "代谢慢的三种自检", rate: "11.8%" },
  { title: "晨起三分钟气血激活", rate: "10.6%" },
  { title: "湿气重的三个误区", rate: "9.9%" },
  { title: "快速缓解头痛的呼吸法", rate: "9.4%" },
];

const words = [
  "睡眠",
  "补气",
  "免疫力",
  "三伏",
  "养生",
  "热量",
  "睡前",
  "调理",
  "代谢",
  "慢性",
  "穴位",
  "食疗",
  "运动",
  "焦虑",
  "自测",
];

const articles = [
  {
    title: "三伏天补气的最佳时间段",
    reads: "8.6k",
    likes: "1.2k",
    watches: "342",
    engagement: "18.1%",
    status: "已摘要",
  },
  {
    title: "体寒体质的夏季调理方案",
    reads: "6.2k",
    likes: "880",
    watches: "290",
    engagement: "18.8%",
    status: "已摘要",
  },
  {
    title: "不花钱的睡眠修复清单",
    reads: "9.1k",
    likes: "1.4k",
    watches: "410",
    engagement: "19.9%",
    status: "已摘要",
  },
  {
    title: "免疫力提升的三类食物",
    reads: "7.4k",
    likes: "960",
    watches: "300",
    engagement: "17.0%",
    status: "已摘要",
  },
  {
    title: "久坐人群的晚间舒缓",
    reads: "4.9k",
    likes: "620",
    watches: "210",
    engagement: "16.9%",
    status: "摘要中",
  },
];

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="选题分析"
        description="基于关键词抓取公众号文章，完成摘要、洞察报告、热度排行与高频词云。"
        badge="选题洞察"
        actions={
          <Button className="rounded-full">
            <Play className="mr-2 h-4 w-4" />
            开始分析
          </Button>
        }
      />

      <Card className="border-border/60 bg-white/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            关键词与抓取设置
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[2fr_repeat(3,_1fr)_auto]">
          <Input placeholder="输入关键词，例如：免疫力提升、睡眠修复" />
          <Select defaultValue="7d">
            <SelectTrigger>
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近 7 天</SelectItem>
              <SelectItem value="30d">最近 30 天</SelectItem>
              <SelectItem value="90d">最近 90 天</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger>
              <SelectValue placeholder="抓取数量" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 篇</SelectItem>
              <SelectItem value="30">30 篇</SelectItem>
              <SelectItem value="50">50 篇</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="on">
            <SelectTrigger>
              <SelectValue placeholder="去重" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">开启去重</SelectItem>
              <SelectItem value="off">不去重</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full">
            <Filter className="mr-2 h-4 w-4" />
            高级筛选
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              分析进度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                已分析 18 / 30 篇
              </span>
              <Badge variant="secondary" className="rounded-full">
                摘要中
              </Badge>
            </div>
            <Progress value={60} className="h-2" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">平均阅读</p>
                <p className="mt-2 text-lg font-semibold">7.2k</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">平均点赞</p>
                <p className="mt-2 text-lg font-semibold">980</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">最高互动率</p>
                <p className="mt-2 text-lg font-semibold">19.9%</p>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
              互动率公式： (点赞 + 在看) / 阅读
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">洞察报告</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ThumbsUp className="h-4 w-4" /> 点赞 Top5
                </div>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {topLikes.map((item) => (
                    <li key={item.title} className="flex justify-between">
                      <span>{item.title}</span>
                      <span>{item.likes}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4" /> 互动率 Top5
                </div>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {topEngagement.map((item) => (
                    <li key={item.title} className="flex justify-between">
                      <span>{item.title}</span>
                      <span>{item.rate}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Cloud className="h-4 w-4" /> 高频词云
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {words.map((word, index) => (
                  <span
                    key={word}
                    className={`rounded-full border border-border/60 bg-white px-3 py-1 ${
                      index % 3 === 0 ? "text-sm font-semibold text-foreground" : ""
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4" /> 选题洞察
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>“可执行步骤”类标题互动率高 18% 以上。</li>
                <li>“清单式”内容更容易获得收藏与在看。</li>
                <li>健康风险提示类话题更易形成传播。</li>
                <li>女性健康、情绪管理是近期增长最快的话题。</li>
                <li>中午 12-14 点阅读高峰，互动集中在 8:00。</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-white/70">
        <CardHeader>
          <CardTitle className="text-base font-semibold">文章列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>阅读</TableHead>
                <TableHead>点赞</TableHead>
                <TableHead>在看</TableHead>
                <TableHead>互动率</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.title}>
                  <TableCell className="font-medium">
                    {article.title}
                  </TableCell>
                  <TableCell>{article.reads}</TableCell>
                  <TableCell>{article.likes}</TableCell>
                  <TableCell>{article.watches}</TableCell>
                  <TableCell>{article.engagement}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {article.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
