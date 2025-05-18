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

  otpData: {
    otp: "",
    email: "",
  },

  kycData: {
    department: "",
    faculty: "",
    matricNo: "",
    level: "",
  },

  setFormData: (newData) =>
    set((state) => ({ formData: { ...state.formData, ...newData } })),

  setOtpData: (newData) =>
    set((state) => ({ otpData: { ...state.otpData, ...newData } })),

  setKycData: (newData) =>
    set((state) => ({ kycData: { ...state.kycData, ...newData } })),
}));
