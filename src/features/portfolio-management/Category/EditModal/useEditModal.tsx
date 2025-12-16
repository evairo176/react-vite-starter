import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import categoryService from "@/core/services/category.service";
import {
    UpdateCategorySchema,
    type UpdateCategoryDTO,
    type IPCategory,
} from "@/core/types/category.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const useEditModal = ({
    close,
    data,
}: {
    close: () => void;
    data: IPCategory | null;
}) => {
    const form = useForm<UpdateCategoryDTO>({
        resolver: zodResolver(UpdateCategorySchema),
        defaultValues: {
            name: "",
            slug: "",
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        if (data) {
            form.reset({
                name: data.name,
                slug: data.slug,
            });
        }
    }, [data, form]);

    const UpdateDatabase = async (payload: UpdateCategoryDTO) => {
        if (!data?.id) return;
        const res = await categoryService.update(data.id, payload);
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

    const handleSubmit = async (payload: UpdateCategoryDTO) => {
        mutateSaveToDatabase(payload);
    };

    return {
        form,
        handleSubmit,
        isPendingMutateSaveToDatabase,
        isSuccessMutateSaveToDatabase,
    };
};

export default useEditModal;
