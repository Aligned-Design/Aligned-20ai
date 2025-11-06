export interface Post {
  id: string;
  brandId: string;
  platform?: string;
  content: any;
  status?: string;
  scheduledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
