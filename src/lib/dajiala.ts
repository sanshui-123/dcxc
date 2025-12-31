export interface DajialaResponse {
  code: number;
  cost_money: number;
  cut_words: string;
  data: DajialaArticle[];
  data_number: number;
  msg: string;
  page: number;
  remain_money: number;
  total: number;
  total_page: number;
  [property: string]: unknown;
}

export interface DajialaArticle {
  avatar: string;
  classify: string;
  content: string;
  ghid: string;
  ip_wording: string;
  is_original: number;
  looking: number;
  praise: number;
  publish_time: number;
  publish_time_str: string;
  read: number;
  short_link: string;
  title: string;
  update_time: number;
  update_time_str: string;
  url: string;
  wx_id: string;
  wx_name: string;
  [property: string]: unknown;
}

export interface DajialaArticleHtmlResponse {
  code: number;
  cost_money: number;
  data: DajialaArticleHtmlData;
  msk: string;
  remain_money: number;
  [property: string]: unknown;
}

export interface DajialaArticleHtmlData {
  article_url: string;
  author: string;
  biz: string;
  copyright: number;
  cover_url: string;
  desc: string;
  gh_id: string;
  html: string;
  mp_head_img: string;
  nickname: string;
  post_time: number;
  post_time_str: string;
  signature: string;
  source_url: string;
  title: string;
  wxid: string;
  [property: string]: unknown;
}
