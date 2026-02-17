import axios from "@/api/request";

// 直接写死你要请求的绝对路径
const NEWSNOW_API = "/newsnow-api/s";

/**
 * 获取热榜分类数据 (DailyHot + Newsnow 融合版)
 */
export const getHotLists = async (type, isNew = false, params) => {
  try {
    // 1. 优先尝试从 DailyHot 的 API 获取数据 (这里走拦截器，会被加上 VITE_GLOBAL_API)
    const res = await axios({
      method: "GET",
      url: `/${type}`,
      customSilent: true, 
      params: {
        cache: !isNew,
        ...params,
      },
    });

    if (res && res.code === 200) {
      return res;
    }
    throw new Error("DailyHot 获取失败或未包含该榜单");

  } catch (error) {
    console.warn(`[${type}] DailyHot 暂无数据，正在切换到 Newsnow 备用源...`);

    try {
      // 2. 回退策略：使用原生 fetch，彻底绕开 axios 的 baseURL 污染，直接请求目标地址！
      const targetUrl = `${NEWSNOW_API}?id=${type}&latest=${isNew}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        // 补充一下 headers 以防后端校验
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`备用源 HTTP 错误: ${response.status}`);
      }

      const data = await response.json();
      
      // 3. 将 newsnow 返回的数据结构抹平
      if (data && (data.status === "success" || data.status === "cache")) {
        return {
          code: 200,
          title: "获取成功",
          message: "(Newsnow源)",
          updateTime: data.updatedTime,
          data: data.items.map(item => ({
            title: item.title,
            url: item.url,
            mobileUrl: item.mobileUrl || item.url
          }))
        };
      } else {
        return { code: 500, title: "获取失败", message: "备用源接口异常" };
      }
    } catch (newsnowError) {
      console.error(`[${type}] 备用源同样请求失败:`, newsnowError);
      return { code: 500, title: "获取失败", message: "数据源均不可用" };
    }
  }
};