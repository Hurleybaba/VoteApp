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

  setFormData: (newData) =>
    set((state) => ({ formData: { ...state.formData, ...newData } })),
}));
