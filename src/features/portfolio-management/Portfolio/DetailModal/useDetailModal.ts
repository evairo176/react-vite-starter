import { useQuery } from "@tanstack/react-query";
import portfolioService from "@/core/services/portfolio.service";

type UseDetailModalProps = {
    id: string;
    open: boolean;
};

const useDetailModal = ({ id, open }: UseDetailModalProps) => {
    const fetchDetail = async () => {
        if (!id) return null;
        const res = await portfolioService.findOne(id);
        return res.data?.data;
    };

    const {
        data: portfolio,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["portfolio-detail", id],
        queryFn: fetchDetail,
        enabled: !!id && open,
    });

    return {
        portfolio,
        isLoading,
        isError,
        refetch,
    };
};

export default useDetailModal;
