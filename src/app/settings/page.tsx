import { KeyRound, ShieldCheck, Timer } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="设置"
        description="配置第三方 API、默认发布节奏与回调信息。"
        badge="系统配置"
        actions={<Button className="rounded-full">保存配置</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-white/70">
          <CardHeader className="flex flex-row items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <CardTitle className="text-base font-semibold">
              关键词抓取 API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="API Base URL" />
            <Input placeholder="API Key" type="password" />
            <Textarea placeholder="回调配置（可选）" className="min-h-[90px]" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">
                公众号文章
              </Badge>
              <Badge variant="outline" className="rounded-full">
                文章正文+互动数据
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <CardTitle className="text-base font-semibold">
              AI 生成接口
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="OpenAI 兼容 Base URL" />
            <Input placeholder="Model 名称" />
            <Input placeholder="API Key" type="password" />
            <Textarea placeholder="系统提示词" className="min-h-[90px]" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-white/70">
          <CardHeader className="flex flex-row items-center gap-2">
            <Timer className="h-4 w-4" />
            <CardTitle className="text-base font-semibold">
              定时发布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Select defaultValue="asia-shanghai">
                <SelectTrigger>
                  <SelectValue placeholder="时区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-shanghai">
                    Asia/Shanghai (北京)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input defaultValue="08:00" />
            </div>
            <Input placeholder="默认发布日期（可选）" />
            <Badge variant="secondary" className="rounded-full">
              每日 08:00 自动发布
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/70">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <CardTitle className="text-base font-semibold">
              发布回写配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="回写 Webhook URL" />
            <Input placeholder="Secret Token" type="password" />
            <Textarea
              placeholder="失败原因通知模板"
              className="min-h-[90px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
