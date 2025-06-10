// Базовые типы для часто используемых пропсов
export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithOnClick {
  onClick?: () => void;
}

// Комбинированные типы
export type BaseComponentProps = WithChildren & WithClassName;
