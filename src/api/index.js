import axios from "@/api/request";
import originAxios from "axios"; 

const NEWSNOW_API = import.meta.env.VITE_NEWSNOW_API || "https://newsnow.busiyi.world/api/s";

// 创建一个完全干净的 axios 实例，专门给 newsnow 用，防止带上 dailyhot 自己的 token 导致跨域失败
const pureAxios = originAxios.create({
  // 注意：千万不要在这里设置 headers.Authorization
});

export const getHotLists = async (type, isNew = false, params) => {
  try {
    const res = await axios({
      method: "GET",
      url: `/${type}`,
      customSilent: true,
      params: { cache: !isNew, ...params },
    });

    if (res && res.code === 200) return res;
    throw new Error("DailyHot 获取失败");

  } catch (error) {
    console.warn(`[${type}] 切换到 Newsnow 备用源...`);

    try {
      // 👉 关键点：使用 pureAxios，并且显式把 headers 清空
      const newsnowRes = await pureAxios.get(NEWSNOW_API, {
        params: { id: type, latest: isNew },
        headers: {} // 清空多余的 headers，防止触发复杂的 CORS 预检
      });

      const data = newsnowRes.data;
      if (data && (data.status === "success" || data.status === "cache")) {
        return {
          code: 200,
          title: "获取成功",
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
      console.error(`[${type}] 备用源请求失败:`, newsnowError);
      return { code: 500, title: "获取失败", message: "备用源不可用(可能遭遇跨域拦截)" };
    }
  }
};