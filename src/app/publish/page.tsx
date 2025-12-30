import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  RefreshCw,
  Send,
  XCircle,
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

const publishItems = [
  {
    title: "三伏养生的五个误区",
    status: "scheduled",
    time: "今日 08:00",
    updated: "5 分钟前",
  },
  {
    title: "换季时的补气节奏",
    status: "draft",
    time: "未设置",
    updated: "1 小时前",
  },
  {
    title: "午后犯困的三种救急法",
    status: "publishing",
    time: "即时发布",
    updated: "刚刚",
  },
  {
    title: "女性气血不足的早晨流程",
    status: "published",
    time: "已发布",
    updated: "昨天 08:03",
  },
  {
    title: "高互动率标题模板拆解",
    status: "failed",
    time: "重试中",
    updated: "2 天前",
  },
];

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  scheduled: { label: "定时中", variant: "secondary" },
  draft: { label: "草稿", variant: "outline" },
  publishing: { label: "发布中", variant: "default" },
  published: { label: "已发布", variant: "secondary" },
  failed: { label: "失败", variant: "outline" },
};

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <CalendarClock className="h-4 w-4 text-amber-600" />,
  draft: <Clock3 className="h-4 w-4 text-muted-foreground" />,
  publishing: <Send className="h-4 w-4 text-foreground" />,
  published: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  failed: <XCircle className="h-4 w-4 text-rose-600" />,
};

export default function PublishPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="发布管理"
        description="管理所有 AI 生成文章的发布节奏，支持定时发布与失败重试。"
        badge="公众号发布"
        actions={
          <>
            <Button variant="outline" className="rounded-full">
              批量定时
            </Button>
            <Button className="rounded-full">
              <Send className="mr-2 h-4 w-4" />
              立即发布
            </Button>
          </>
        }
      />

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
              <SelectItem value="scheduled">定时中</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
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
          <Button variant="outline" className="rounded-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </CardContent>
      </Card>

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
              {publishItems.map((item) => {
                const status = statusMap[item.status];
                return (
                  <TableRow key={item.title}>
                    <TableCell className="font-medium">{item.title}</TableCell>
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
                          <DropdownMenuItem>立即发布</DropdownMenuItem>
                          <DropdownMenuItem>设置定时</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>查看日志</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
