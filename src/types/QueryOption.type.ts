export type QueryOption = {
    page?: number;
    pageSize?: number;
    search?: string;
    sortOrder?: 'DESC' | 'ASC' | 'desc' | 'asc';
    sortField?: string;
    tags?: string[];
    
};
