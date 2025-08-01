import { create } from 'zustand';

interface UserState {
    user: {
        fullName: string;
        profilePicture: string | null;
    };
    setUser: (user: { fullName: string; profilePicture: string | null }) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: {
        fullName: '', 
        profilePicture: null,
    },
    setUser: (user) => set({ user }),
}));