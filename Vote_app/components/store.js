import { create } from "zustand";

export const useFormStore = create((set) => ({
  formData: {
    firstname: "",
    lastname: "",
    middlename: "",
    age: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  },

  pinId: null,

  setPinId: (newPinId) => set({ pinId: newPinId }),

  setFormData: (newData) =>
    set((state) => ({ formData: { ...state.formData, ...newData } })),
}));
