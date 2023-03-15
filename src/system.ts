export const setting = {
  continuousDialogue: true,
  archiveSession: false,
  openaiAPIKey: "",
  openaiAPITemperature: 60,
  systemRule: "",
};

export const message = `- [[Shift]] + [[Enter]] 换行。开头输入 [[/]] 或者 [[空格]] Prompt 预设。[[↑]] 可编辑最近一次提问。点击名称滚动到顶部，点击输入框滚动到底部。`;

export type Setting = typeof setting;

// 是否刷新页面时重置该选项（支持持续会话）
export const resetContinuousDialogue = false;
