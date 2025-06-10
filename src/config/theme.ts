export const THEME = {
  colors: {
    // Основные цвета
    secondary: 'rgb(112, 26, 117)', // Наш акцентный цвет
    
    // Фоны
    cardLight: 'bg-white',
    cardDark: 'bg-[#2C2C2C]',
    backgroundLight: 'bg-[#F4F4F5]', // Светло-серый фон для плашек
    backgroundDark: 'bg-[#242424]', // Темный фон для плашек в dark mode
    
    // Текст
    textPrimary: 'text-default-900 dark:text-white',
    textSecondary: 'text-default-600',
    textMuted: 'text-default-500',
    
    // Состояния и акценты
    secondaryLight: 'bg-secondary/5',
    secondaryBorder: 'border-secondary/10',
    secondaryHover: 'hover:text-secondary',
    
    // Тени
    shadowSmall: 'shadow-small',
  },
  
  // Часто используемые комбинации классов
  components: {
    card: 'bg-white dark:bg-[#2C2C2C] shadow-small',
    heading: 'text-default-900 dark:text-white font-semibold',
    text: 'text-default-600',
    button: {
      primary: 'bg-secondary text-white',
      light: 'bg-secondary/10 text-secondary',
    },
    input: 'bg-[#F4F4F5] dark:bg-[#242424]', // Добавили стиль для инпутов
    panel: 'bg-[#F4F4F5] dark:bg-[#242424]', // Добавили стиль для плашек/панелей
  }
}; 