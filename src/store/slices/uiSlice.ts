import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isLoading: boolean;
  theme: "light" | "dark";
}

const initialState: UiState = {
  isLoading: false,
  theme: "light"
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleTheme: state => {
      state.theme = state.theme === "light" ? "dark" : "light";
    }
  }
});

export const { setLoading, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
