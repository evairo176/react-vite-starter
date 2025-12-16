import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import categoryService from "@/core/services/category.service";
import {
    CreateCategorySchema,
    type CreateCategoryDTO,
} from "@/core/types/category.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useAddModal = ({ close }: { close: () => void }) => {
    const form = useForm<CreateCategoryDTO>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            name: "",
            slug: "",
        },
        mode: "onSubmit",
    });

    const AddToDatabase = async (payload: CreateCategoryDTO) => {
        const res = await categoryService.create(payload);
        return res;
    };

    const {
        mutate: mutateSaveToDatabase,
        isPending: isPendingMutateSaveToDatabase,
        isSuccess: isSuccessMutateSaveToDatabase,
    } = useMutation({
        mutationFn: AddToDatabase,
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

    const handleSubmit = async (payload: CreateCategoryDTO) => {
        mutateSaveToDatabase(payload);
    };

    return {
        form,
        handleSubmit,
        isPendingMutateSaveToDatabase,
        isSuccessMutateSaveToDatabase,
    };
};

export default useAddModal;
