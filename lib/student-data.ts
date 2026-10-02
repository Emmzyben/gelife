export type EnrollmentRecord = {
  status: string;
  completed: number;
  percent: number;
  created_at?: string | null;
  course: {
    id: number;
    slug: string | number;
    title: string;
    description: string;
    thumbnail_url?: string | null;
    price: number;
    category: string;
    accent: string;
    lessons: null[];
  };
};

export type StudentModule = {
  id: number;
  title: string;
  content_text?: string;
  assets?: { id: number; asset_type: "video" | "pdf" | "spreadsheet"; file_path: string }[];
};

export type StudentCourseData = {
  course: {
    title: string;
    description: string;
    price: number;
    thumbnail_url?: string | null;
  };
  modules: StudentModule[];
  completed_module_ids: number[];
  percent: number;
};