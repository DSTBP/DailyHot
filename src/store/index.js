import { defineStore } from "pinia";

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 新闻类别
      defaultNewsArr: [
        { label: "哔哩哔哩", name: "bilibili", order: 0, show: true },
        { label: "微博", name: "weibo", order: 1, show: true },
        { label: "抖音", name: "douyin", order: 2, show: true },
        { label: "知乎", name: "zhihu", order: 3, show: true },
        { label: "36氪", name: "36kr", order: 4, show: true },
        { label: "百度", name: "baidu", order: 5, show: true },
        { label: "少数派", name: "sspai", order: 6, show: true },
        { label: "IT之家", name: "ithome", order: 7, show: true },
        { label: "澎湃新闻", name: "thepaper", order: 8, show: true },
        { label: "今日头条", name: "toutiao", order: 9, show: true },
        { label: "百度贴吧", name: "tieba", order: 10, show: true },
        { label: "稀土掘金", name: "juejin", order: 11, show: true },
        { label: "腾讯新闻", name: "qq-news", order: 12, show: true },
        { label: "豆瓣电影", name: "douban-movie", order: 13, show: true },
        { label: "原神", name: "genshin", order: 14, show: true },
        { label: "LOL", name: "lol", order: 15, show: true },
        { label: "崩坏：星穹铁道", name: "starrail", order: 16, show: true },
        { label: "网易新闻", name: "netease-news", order: 17, show: true },
        { label: "微信读书", name: "weread", order: 18, show: true },
        { label: "豆瓣讨论小组", name: "douban-group", order: 19, show: true },
        { label: "NGA", name: "ngabbs", order: 20, show: true },
        { label: "HelloGitHub", name: "hellogithub", order: 21, show: true },
        { label: "简书", name: "jianshu", order: 22, show: true },
        { label: "知乎日报", name: "zhihu-daily", order: 23, show: true },
        
        // ================= 从这里开始是集成的 Newsnow 源 =================
        { label: "V2EX", name: "v2ex", order: 24, show: true },
        { label: "联合早报", name: "zaobao", order: 25, show: true },
        { label: "酷安", name: "coolapk", order: 26, show: true },
        { label: "MKTNews", name: "mktnews", order: 27, show: true },
        { label: "华尔街见闻", name: "wallstreetcn", order: 28, show: true },
        { label: "虎扑", name: "hupu", order: 29, show: true },
        { label: "卫星通讯社", name: "sputniknewscn", order: 30, show: true },
        { label: "参考消息", name: "cankaoxiaoxi", order: 31, show: true },
        { label: "远景论坛", name: "pcbeta", order: 32, show: true },
        { label: "财联社", name: "cls", order: 33, show: true },
        { label: "雪球", name: "xueqiu", order: 34, show: true },
        { label: "格隆汇", name: "gelonghui", order: 35, show: true },
        { label: "法布财经", name: "fastbull", order: 36, show: true },
        { label: "Solidot", name: "solidot", order: 37, show: true },
        { label: "Hacker News", name: "hackernews", order: 38, show: true },
        { label: "Product Hunt", name: "producthunt", order: 39, show: true },
        { label: "靠谱新闻", name: "kaopu", order: 40, show: true },
        { label: "Github", name: "github", order: 41, show: true },
        { label: "金十数据", name: "jin10", order: 42, show: true },
        { label: "牛客", name: "nowcoder", order: 43, show: true },
        { label: "凤凰网", name: "ifeng", order: 44, show: true },
        { label: "虫部落", name: "chongbuluo", order: 45, show: true },
        { label: "豆瓣综合", name: "douban", order: 46, show: true },
        { label: "Steam", name: "steam", order: 47, show: true },
        { label: "Freebuf", name: "freebuf", order: 48, show: true },
        { label: "腾讯视频", name: "qqvideo", order: 49, show: true },
        { label: "爱奇艺", name: "iqiyi", order: 50, show: true },
        { label: "快手", name: "kuaishou", order: 51, show: true },
      ],
      newsArr: [],
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 时间数据
      timeData: null,
      // 字体大小
      listFontSize: 16,
    };
  },
  getters: {},
  actions: {
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val;
      this.siteThemeAuto = false;
    },
    // 检查更新
    checkNewsUpdate() {
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      console.log("列表尝试更新", this.defaultNewsArr, this.newsArr);
      // 执行比较并迁移
      if (this.newsArr.length > 0) {
        for (const newItem of this.defaultNewsArr) {
          const exists = this.newsArr.some(
            (news) => newItem.label === news.label && newItem.name === news.name
          );
          if (!exists) {
            console.log("列表有更新：", newItem);
            updatedNum++;
            this.newsArr.push(newItem);
          }
        }
        if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
      } else {
        console.log("列表无内容，写入默认");
        this.newsArr = this.defaultNewsArr;
      }
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "linkOpenType",
        "headerFixed",
        "listFontSize",
      ],
    },
  ],
});