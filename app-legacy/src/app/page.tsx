import Layout from "@/components/Layout";
import Link from "next/link";

export default function Home() {
  const stats = [
    {
      title: "总收入",
      value: "¥45,231.89",
      change: "+20.1%",
      period: "较上月",
      icon: "fa-dollar-sign",
    },
    {
      title: "新增粉丝",
      value: "+2,350",
      change: "+180.1%",
      period: "较上月",
      icon: "fa-users",
    },
    {
      title: "文章总数",
      value: "89",
      change: "+12",
      period: "本月新增",
      icon: "fa-file-lines",
    },
    {
      title: "平均阅读率",
      value: "12.5%",
      change: "+2.3%",
      period: "较上月",
      icon: "fa-chart-line",
    },
  ];

  const recentArticles = [
    {
      id: 1,
      title: "2024年冬虫夏草市场行情深度解析",
      views: 12450,
      date: "2024-10-24",
      status: "published",
    },
    {
      id: 2,
      title: "如何辨别那曲虫草与玉树虫草？",
      views: 8900,
      date: "2024-10-22",
      status: "published",
    },
    {
      id: 3,
      title: "虫草炖鸡的正确做法与禁忌",
      views: 0,
      date: "2024-10-20",
      status: "draft",
    },
    {
      id: 4,
      title: "鲜虫草与干虫草的营养价值对比",
      views: 0,
      date: "2024-10-28",
      status: "scheduled",
    },
    {
      id: 5,
      title: "冬虫夏草的食用时间与注意事项",
      views: 3250,
      date: "2024-10-18",
      status: "published",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      published: <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">已发布</span>,
      draft: <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">草稿</span>,
      scheduled: <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">定时</span>,
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  return (
    <Layout
      title="仪表盘"
      action={
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <i className="fa-solid fa-plus h-4 w-4"></i>
          新建文章
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm"
            >
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <i className={`fa-solid ${stat.icon} h-4 w-4 text-muted-foreground`}></i>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span>
                <span>{stat.period}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Chart Area */}
          <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">阅读量趋势</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                近7日 <i className="fa-solid fa-chevron-down ml-1"></i>
              </button>
            </div>
            <div className="mt-6 h-64 flex items-end justify-between gap-2">
              {[35, 52, 38, 65, 48, 78, 62].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full rounded-t-sm bg-muted relative h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full bg-foreground group-hover:bg-primary transition-all duration-300"
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">10-{20 + i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Articles */}
          <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">最近文章</h3>
              <Link href="/publish" className="text-sm text-muted-foreground hover:text-foreground">
                全部
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {recentArticles.slice(0, 5).map((article) => (
                <div
                  key={article.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm">
                    <i className="fa-solid fa-file-lines"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{article.title}</h4>
                    <p className="text-xs text-muted-foreground">{article.date}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(article.status)}
                    {article.status === "published" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {article.views.toLocaleString()} 阅读
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
