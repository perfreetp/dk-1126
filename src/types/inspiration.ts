export interface Inspiration {
  id: string;
  type: 'text' | 'image' | 'voice' | 'webpage';
  content: string;
  imageUrl?: string;
  source?: string;
  tags: string[];
  project?: string;
  mood?: 'creative' | 'calm' | 'energetic' | 'romantic' | 'serious';
  color?: string;
  purpose?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollageGroup {
  id: string;
  name: string;
  description?: string;
  inspirationIds: string[];
  createdAt: string;
}

export interface FilterOptions {
  project?: string;
  mood?: string;
  color?: string;
  purpose?: string;
}

export interface SearchOptions {
  keyword?: string;
  tags?: string[];
  recentDays?: number;
}
