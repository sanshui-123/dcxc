import {
  ImagePlus,
  ListChecks,
  PenLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const topics = [
  "三伏天免疫力提升的简单动作",
  "湿气重人群的饮食调整",
  "睡前 15 分钟的修复流程",
  "女性气血不足的日常方案",
  "办公室久坐的恢复节奏",
];

const images = [
  { id: "img-1", title: "晨光植物", size: "1200x900" },
  { id: "img-2", title: "健康餐桌", size: "1200x900" },
  { id: "img-3", title: "冥想呼吸", size: "1200x900" },
  { id: "img-4", title: "运动热身", size: "1200x900" },
];

export default function CreatePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="内容创作"
        description="从洞察报告中选择选题，一键生成 Markdown 文章并插入 Unsplash 图片。"
        badge="创作工作台"
        actions={
          <>
            <Button variant="outline" className="rounded-full">
              <ListChecks className="mr-2 h-4 w-4" />
              生成大纲
            </Button>
            <Button className="rounded-full">
              <Sparkles className="mr-2 h-4 w-4" />
              一键生成
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">选题来源</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="搜索洞察选题" />
            <div className="space-y-2 text-sm">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 transition hover:border-foreground"
                >
                  {topic}
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
              也可在右侧直接输入自定义主题。
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
                支持手动编辑与 AI 生成的混合创作。
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              草稿
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <Input placeholder="输入标题，例如：三伏天提升免疫力的七天计划" />
              <Select defaultValue="professional">
                <SelectTrigger>
                  <SelectValue placeholder="写作风格" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">专业严谨</SelectItem>
                  <SelectItem value="warm">温暖陪伴</SelectItem>
                  <SelectItem value="actionable">行动指南</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="edit" className="mt-5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">编辑</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Textarea
                  className="min-h-[360px]"
                  placeholder="请输入 Markdown 内容，支持标题、列表、引用等格式。"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="min-h-[360px] rounded-xl border border-dashed border-border/70 bg-white/60 p-4 text-sm text-muted-foreground">
                  预览区域：生成后会在此展示公众号排版预览。
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full">
                <PenLine className="mr-2 h-4 w-4" />
                保存草稿
              </Button>
              <Button className="rounded-full">
                <WandSparkles className="mr-2 h-4 w-4" />
                保存到发布管理
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">图片素材</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="3">
              <SelectTrigger>
                <SelectValue placeholder="图片数量" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 张</SelectItem>
                <SelectItem value="4">4 张</SelectItem>
                <SelectItem value="6">6 张</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="landscape">
              <SelectTrigger>
                <SelectValue placeholder="方向" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">横图优先</SelectItem>
                <SelectItem value="square">方图混合</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full rounded-full">
              <ImagePlus className="mr-2 h-4 w-4" />
              从 Unsplash 抓图
            </Button>

            <div className="space-y-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-xl border border-border/60 bg-white/70 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{image.title}</span>
                    <Badge variant="secondary" className="rounded-full">
                      {image.size}
                    </Badge>
                  </div>
                  <div className="mt-3 h-20 rounded-lg bg-gradient-to-br from-amber-100 via-orange-50 to-white" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full rounded-full"
                  >
                    插入到正文
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
