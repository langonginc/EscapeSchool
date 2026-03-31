import { Dialog, DialogJson } from '../constants/dialog';

export const loadDialog = async (id: string): Promise<Dialog[]> => {
    try {
        // 请求路径直接写绝对路径，Vite 会自动去 public 文件夹下找
        const response = await fetch(`/EscapeSchool/dialog/${id}.json`);
        
        // 检查网络请求是否成功 (比如文件不存在会报 404)
        if (!response.ok) {
            throw new Error(`无法加载对话文件: ${id}.json (状态码: ${response.status})`);
        }

        // fetch 自带的 .json() 方法可以直接把文本转成对象
        const data: DialogJson = await response.json();
        return data.dialogs;
        
    } catch (error) {
        console.error("加载对话失败:", error);
        return []; // 发生错误时返回空数组，防止游戏崩溃
    }
}