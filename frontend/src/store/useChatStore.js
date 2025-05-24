import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data })
    } catch (error) {
      toast.error("Error fetching users: " + error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async(userId) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({messages: res.data})
    } catch (error) {
      toast.error("Error fetching messages: " + error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));