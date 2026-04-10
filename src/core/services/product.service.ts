import api from "../api/axios";
import type { CreateProductDTO, UpdateProductDTO } from "../types/product.type";
import type { PurchaseDTO, SaleDTO } from "../types/transaction.type";

const productService = {
  findAll: async (params?: string) => api.get(`/products?${params}`),
  // findOne: async (id: string) => api.get(`/portfolio-product/${id}`),
  create: async (payload: CreateProductDTO) => api.post("/products", payload),
  update: async (id: string, payload: UpdateProductDTO) =>
    api.put(`/products/${id}`, payload),
  purchase: async (payload: PurchaseDTO) =>
    api.post(`/transactions/purchase`, payload),
  sale: async (payload: SaleDTO) => api.post(`/transactions/sale`, payload),
  // destroy: async (id: string) => api.delete(`/portfolio-product/${id}`),
};

export default productService;
