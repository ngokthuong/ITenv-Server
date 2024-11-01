export type ResponseType<T> = {
  success: boolean;
  data?: T | null;
  total?: number;
  error?: string;
  message?: string;
};

export interface ResponseAxios {
  success: boolean;
  message: string;
}
