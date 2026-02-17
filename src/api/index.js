import axios from "@/api/request";
import originAxios from "axios"; // 引入原生 axios，用来请求 newsnow 以跳过全局拦截器

// 读取配置好的 Newsnow 接口地址
const NEWSNOW_API = "/newsnow-api/s";

/**
 * 获取热榜分类数据 (DailyHot + Newsnow 融合版)
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
 * @returns
 */
export const getHotLists = async (type, isNew = false, params) => {
  try {
    // 1. 优先尝试从 DailyHot 的 API 获取数据
    const res = await axios({
      method: "GET",
      url: `/${type}`,
      customSilent: true, // 开启刚才加的静默属性，防止 dailyhot 查不到时页面弹红框
      params: {
        cache: !isNew,
        ...params,
      },
    });

    // 如果 DailyHot 正常返回了数据
    if (res && res.code === 200) {
      return res;
    }
    // 如果返回的 code 不是 200，当做失败处理，走下方 catch
    throw new Error("DailyHot 获取失败或未包含该榜单");

  } catch (error) {
    console.warn(`[${type}] DailyHot 暂无数据，正在切换到 Newsnow 备用源...`);

    try {
      // 2. 回退策略：去请求 newsnow 的 API
      const newsnowRes = await originAxios.get(NEWSNOW_API, {
        params: {
          id: type, // 财联社的话，type 也就是 'cls'
          latest: isNew
        }
      });

      const data = newsnowRes.data;
      
      // 3. 将 newsnow 返回的数据结构抹平，伪装成 DailyHot 期望的数据结构
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
        // Newsnow 返回了非成功状态
        return { code: 500, title: "获取失败", message: "备用源接口异常" };
      }
    } catch (newsnowError) {
      console.error(`[${type}] 备用源同样请求失败:`, newsnowError);
      return { code: 500, title: "获取失败", message: "数据源均不可用" };
    }
  }
};