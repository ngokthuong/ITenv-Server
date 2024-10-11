export type ResponseType<T> = {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
  timeStamp?: Date
};
