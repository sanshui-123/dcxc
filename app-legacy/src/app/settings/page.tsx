"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("a9f4f82550db4ac5b042f2a4b2f2bd44.P9wIMoCQUVnBoW3M");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <Layout title="设置">
      <div className="max-w-2xl space-y-6">
        {/* API Configuration */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <i className="fa-solid fa-key h-4 w-4"></i>
            </div>
            <div>
              <h3 className="font-semibold">API 配置</h3>
              <p className="text-sm text-muted-foreground">配置 GLM-4.7 API 用于 AI 功能</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* WeChat Configuration */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <i className="fa-brands fa-weixin h-4 w-4"></i>
            </div>
            <div>
              <h3 className="font-semibold">公众号配置</h3>
              <p className="text-sm text-muted-foreground">配置微信公众号接口</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">公众号名称</label>
              <input
                type="text"
                defaultValue="冬虫夏草科普"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">AppID</label>
              <input
                type="text"
                placeholder="wx..."
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">AppSecret</label>
              <input
                type="password"
                placeholder="••••••••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <i className="fa-solid fa-sliders h-4 w-4"></i>
            </div>
            <div>
              <h3 className="font-semibold">偏好设置</h3>
              <p className="text-sm text-muted-foreground">自定义系统行为</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">消息通知</p>
                <p className="text-sm text-muted-foreground">接收文章发布、阅读量更新等通知</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动保存</p>
                <p className="text-sm text-muted-foreground">编辑时自动保存草稿</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  autoSave ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    autoSave ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-muted transition">
            取消
          </button>
          <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
            保存设置
          </button>
        </div>
      </div>
    </Layout>
  );
}
