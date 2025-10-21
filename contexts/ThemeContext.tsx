
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme as Theme) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


// --- Language Context ---

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // General
  researcherDashboard: { en: 'Researcher Dashboard', es: 'Panel del Investigador', pt: 'Painel do Pesquisador' },
  active: { en: 'Active', es: 'Activo', pt: 'Ativo' },
  
  // UserHomePage
  myAvailableCampaigns: { en: 'My Available Campaigns', es: 'Mis Campañas Disponibles', pt: 'Minhas Campanhas Disponíveis' },
  searchCampaign: { en: 'Search campaign...', es: 'Buscar campaña...', pt: 'Buscar campanha...' },
  progress: { en: 'Progress', es: 'Progreso', pt: 'Progresso' },
  goalMet: { en: 'Goal Reached', es: 'Meta Alcanzada', pt: 'Meta Atingida' },
  startSurvey: { en: 'Start Survey', es: 'Iniciar Encuesta', pt: 'Iniciar Pesquisa' },
  loadingCampaigns: { en: 'Loading campaigns...', es: 'Cargando campañas...', pt: 'Carregando campanhas...' },
  noCampaignsFound: { en: 'No campaigns found with that name.', es: 'No se encontraron campañas con ese nombre.', pt: 'Nenhuma campanha encontrada com esse nome.' },
  noCampaignsAssigned: { en: 'No campaigns have been assigned to you at the moment.', es: 'No se le han asignado campañas en este momento.', pt: 'Nenhuma campanha foi atribuída a você no momento.' },
  tryAnotherTerm: { en: 'Try searching for another term.', es: 'Intente buscar otro término.', pt: 'Tente buscar por outro termo.' },
  contactAdmin: { en: 'Please contact an administrator.', es: 'Por favor, póngase en contacto con un administrador.', pt: 'Por favor, entre em contato com um administrador.' },
  
  // SurveyPage
  surveyTerms: { en: 'Survey Terms', es: 'Términos de la Encuesta', pt: 'Termos da Pesquisa' },
  beforeYouStart: { en: 'Before you start...', es: 'Antes de comenzar...', pt: 'Antes de começar...' },
  agreeToTerms: { en: 'Please read and agree to the data usage terms to participate in this campaign.', es: 'Por favor, lea y acepte los términos de uso de datos para participar en esta campaña.', pt: 'Por favor, leia e concorde com os termos de uso de dados para participar desta campanha.' },
  privacyTermsTitle: { en: 'Privacy and Data Use Terms', es: 'Términos de Privacidad y Uso de Datos', pt: 'Termos de Privacidade e Uso de Dados' },
  agreeAndParticipate: { en: 'I agree and want to participate', es: 'Acepto y quiero participar', pt: 'Concordo e quero participar' },
  participantId: { en: 'Participant Identification', es: 'Identificación del Participante', pt: 'Identificação do Participante' },
  fillDataToContinue: { en: 'Please fill in your details to continue.', es: 'Por favor, complete sus datos para continuar.', pt: 'Por favor, preencha seus dados para continuar.' },
  fullName: { en: 'Full Name', es: 'Nombre Completo', pt: 'Nome Completo' },
  ageRange: { en: 'Age Range', es: 'Rango de Edad', pt: 'Faixa Etária' },
  selectAgeRange: { en: 'Please select your age range.', es: 'Por favor, seleccione su rango de edad.', pt: 'Por favor, selecione sua faixa etária.' },
  phoneWhatsapp: { en: 'Phone (WhatsApp)', es: 'Teléfono (WhatsApp)', pt: 'Telefone (WhatsApp)' },
  startSurveyButton: { en: 'Start Survey', es: 'Iniciar Encuesta', pt: 'Iniciar Pesquisa' },
  loadingSurvey: { en: 'Loading survey...', es: 'Cargando encuesta...', pt: 'Carregando pesquisa...' },
  answeringSurvey: { en: 'Answering Survey', es: 'Respondiendo Encuesta', pt: 'Respondendo Pesquisa' },
  yourAnswer: { en: 'Your answer...', es: 'Su respuesta...', pt: 'Sua resposta...' },
  previous: { en: 'Previous', es: 'Anterior', pt: 'Anterior' },
  next: { en: 'Next', es: 'Siguiente', pt: 'Próximo' },
  finish: { en: 'Finish', es: 'Finalizar', pt: 'Finalizar' },

  // Header
  myProfile: { en: 'My Profile', es: 'Mi Perfil', pt: 'Meu Perfil' },
  logout: { en: 'Logout', es: 'Salir', pt: 'Sair' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    return (storedLang as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || translations[key]?.['pt'] || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};