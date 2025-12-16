export interface IDashboardAnalytics {
    topTags: {
        id: string;
        name: string;
        count: number;
    }[];
    topTechStacks: {
        id: string;
        name: string;
        count: number;
    }[];
    topCategories: {
        id: string;
        name: string;
        count: number;
    }[];
}
