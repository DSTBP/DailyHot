import axios from "@/api/request";

const NEWSNOW_API = "/newsnow-api/s";

/**
 * 获取热榜分类数据 (DailyHot + Newsnow 融合版)
 */
export const getHotLists = async (type, isNew = false, params) => {
  try {
    // 1. 优先尝试从 DailyHot 的 API 获取数据
    const res = await axios({
      method: "GET",
      url: `/${type}`,
      customSilent: true, 
      params: {
        cache: !isNew,
        ...params,
      },
    });

    // 【新增逻辑】：严格校验 DailyHot 返回的数据是否真实有效
    if (res && res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
      // 检查数据列表，只要有一条数据看起来是正常的（有标题且URL没有包含undefined）
      const isValidData = res.data.some(item => {
        const hasTitle = item.title && item.title.trim() !== ""; // 有标题
        const hasValidUrl = item.url && !String(item.url).includes("undefined"); // URL 不能包含 undefined
        return hasTitle && hasValidUrl;
      });

      // 数据确实正常，才真正返回给前端渲染
      if (isValidData) {
        return res; 
      }
    }
    
    // 如果虽然返回了 200，但数据为空、或者是 undefined 的脏数据，主动抛错进入下方的 catch 走备用源
    throw new Error("DailyHot 获取成功但数据内容无效(脏数据/空列表)");

  } catch (error) {
    console.warn(`[${type}] DailyHot 无有效数据，切换到 Newsnow 备用源...`);

    try {
      // 2. 回退策略：使用原生 fetch
      const targetUrl = `${NEWSNOW_API}?id=${type}&latest=${isNew}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
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
          // newsnow 的 type 等效于 subtitle，这里随便给个类型字段，方便我们在骨架屏那里用
          type: "热榜", 
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
      // return { code: 500, title: "获取失败", message: "数据源均不可用" };
    }
  }
};