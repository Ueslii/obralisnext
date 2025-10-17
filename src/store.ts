import { configureStore } from "@reduxjs/toolkit";

// A biblioteca de gráficos (recharts) requer um Provedor Redux para funcionar corretamente,
// mesmo que o resto da sua aplicação não use Redux.
// Este é um "reducer" vazio que satisfaz essa necessidade.
const placeholderReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    // A chave do reducer pode ser qualquer nome.
    placeholder: placeholderReducer,
  },
});

// Exporta os tipos para uso futuro, caso você decida adotar o Redux.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
