import api from "../api/axios";

const menuService = {
  getMenu: async () => {
    const res = await api.get(`/menu`);
    return res.data;
  },
};

export default menuService;
