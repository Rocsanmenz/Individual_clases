import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        translation: {
          menu: {
            inicio: "Inicio",
            categorias: "Categorías",
            productos: "Productos",
            catalogo: "Catálogo",
            libros: "Libros",
            clima: "Clima",
            pronunciacion: "Pronunciación",
            estadisticas: "Estadísticas",
            cerrarSesion: "Cerrar Sesión",
            iniciarSesion: "Iniciar Sesión",
            idioma: "Idioma",
            español: "Español",
            japones: "Japonés",
            ingles: "Inglés",
            empleados: "Empleados"
          },
        },
      },
      ja: {
        translation: {
          menu: {
            inicio: "ホーム",
            categorias: "カテゴリー",
            productos: "製品",
            catalogo: "カタログ",
            libros: "本",
            clima: "天気",
            pronunciacion: "発音",
            estadisticas: "統計",
            cerrarSesion: "ログアウト",
            iniciarSesion: "ログイン",
            idioma: "言語",
            español: "スペイン語",
            japones: "日本語",
            ingles: "英語",
            empleados: "従業員"
          },
        },
      },
      en: {
        translation: {
          menu: {
            inicio: "Home",
            categorias: "Categories",
            productos: "Products",
            catalogo: "Catalog",
            libros: "Books",
            clima: "Weather",
            pronunciacion: "Pronunciation",
            estadisticas: "Statistics",
            cerrarSesion: "Log Out",
            iniciarSesion: "Log In",
            idioma: "Language",
            español: "Spanish",
            japones: "Japanese",
            ingles: "English",
            empleados: "Employees"
          },
        },
      },
    },
  });

export default i18n;
