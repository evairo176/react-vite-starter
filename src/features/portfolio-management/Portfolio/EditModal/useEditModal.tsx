import { useMutation, useQuery } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import portfolioService from "@/core/services/portfolio.service";
import {
    UpdatePortfolioSchema,
    type UpdatePortfolioDTO,
    type IPPortfolio,
} from "@/core/types/portfolio.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import categoryService from "@/core/services/category.service";

import { useEffect } from "react";

const useEditModal = ({
    close,
    data,
}: {
    close: () => void;
    data: IPPortfolio | null;
}) => {
    const form = useForm<UpdatePortfolioDTO>({
        resolver: zodResolver(UpdatePortfolioSchema),
        defaultValues: {
            featured: false,
            isPublished: true,
            images: [],
            tagIds: [],
            techIds: [],
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        if (data) {
            form.reset({
                id: data.id,
                title: data.title,
                slug: data.slug,
                shortDesc: data.shortDesc,
                description: data.description,
                categoryId: data.categoryId,
                liveUrl: data.liveUrl,
                repoUrl: data.repoUrl,
                featured: data.featured,
                isPublished: data.isPublished,
                images: data.images || [],
                tagIds: data.tags?.map((t: any) => t.tag.name) || [],
                techIds: data.techStacks?.map((t: any) => t.tech.name) || [],
            });
        }
    }, [data, form]);

    const UpdateDatabase = async (payload: UpdatePortfolioDTO) => {
        if (!data?.id) return;
        const res = await portfolioService.update(data.id, payload);
        return res;
    };

    const {
        mutate: mutateSaveToDatabase,
        isPending: isPendingMutateSaveToDatabase,
        isSuccess: isSuccessMutateSaveToDatabase,
    } = useMutation({
        mutationFn: UpdateDatabase,
        onSuccess: (response) => {
            const message = successCallback(response);

            toast.success(message);
            close();
        },
        onError: (error: any) => {
            const { message } = errorCallback(error);

            toast.error(message);
        },
    });

    const handleSubmit = async (payload: UpdatePortfolioDTO) => {
        mutateSaveToDatabase(payload);
    };

    const findAllCategory = async () => {
        let params = `limit=${1000}&page=${1}`;
        const res = await categoryService.findAll(`${params}`);
        const { data } = res;
        return data?.data;
    };

    const { data: dataCategory } = useQuery({
        queryKey: ["Category-form"],
        queryFn: findAllCategory,
    });

    // Fetching tags/techs not strictly necessary for the input if utilizing free-text tagging, 
    // but kept for consistency if SearchableMultiSelect was used or for suggestions.
    // Since we use TagsInput which is free text (uppercased), we might not need these for options,
    // but let's keep them if we switch back or need suggestions.

    return {
        form,
        handleSubmit,
        isPendingMutateSaveToDatabase,
        isSuccessMutateSaveToDatabase,
        dataCategory,
    };
};

export default useEditModal;
