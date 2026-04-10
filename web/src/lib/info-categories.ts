export const INFO_CATEGORY_SLUGS = [
  "general",
  "question",
  "training_log",
  "monthly_summary",
  "race_review",
  "race_photo",
  "ready_shot",
  "hot_deal",
  "gear_review",
  "tips",
  "injury_care",
  "race_schedule",
  "running_gear",
  "carbo_loading",
] as const;

export type InfoCategorySlug = (typeof INFO_CATEGORY_SLUGS)[number];

export const INFO_CATEGORY_LABEL: Record<InfoCategorySlug, string> = {
  general: "일반",
  question: "질문",
  training_log: "훈련일지",
  monthly_summary: "월간정리",
  race_review: "대회후기",
  race_photo: "대회사진",
  ready_shot: "준비샷",
  hot_deal: "핫딜",
  gear_review: "장비·리뷰",
  tips: "꿀팁",
  injury_care: "부상·케어",
  race_schedule: "대회일정",
  running_gear: "러닝용품",
  carbo_loading: "카보로딩",
};

export function isInfoCategorySlug(v: string): v is InfoCategorySlug {
  return (INFO_CATEGORY_SLUGS as readonly string[]).includes(v);
}
