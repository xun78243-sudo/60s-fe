export interface ResultState {
  endpointPath: string;
  endpointName: string;
  category: string;
  data: Record<string, unknown> | string | null;
  status: number;
  loading: boolean;
  error: string | null;
  isImage: boolean;
  imageUrl: string | null;
  fetchedAt: number;
}
