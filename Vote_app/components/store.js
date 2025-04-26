import { create } from "zustand";

export const useFormStore = create((set) => ({
  formData: {
    firstName: "",
    lastName: "",
    middleName: "",
    username: "",
    email: "",
    number: "",
  },

  setFormData: (newData) =>
    set((state) => ({ formData: { ...state.formData, ...newData } })),
}));
