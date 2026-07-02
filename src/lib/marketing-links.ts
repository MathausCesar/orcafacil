const APP_BASE_URL = "https://app.zacly.com.br";

function safeAppUrl(path: string) {
    return new URL(path, APP_BASE_URL).toString();
}

function registerUrl(next = "/onboarding") {
    const url = new URL("/register", APP_BASE_URL);
    url.searchParams.set("next", next);
    return url.toString();
}

export const MARKETING_LINKS = {
    login: safeAppUrl("/login"),
    register: registerUrl("/onboarding"),
    registerFree: registerUrl("/onboarding"),
    registerYearly: registerUrl("/pricing?plan=yearly"),
    registerMonthly: registerUrl("/pricing?plan=monthly"),
    resourcesPage: "/recursos",
    howItWorksPage: "/como-funciona",
    pricingPage: "/precos",
    blogPage: "/blog",
    modelsPage: "/modelos",
    aboutPage: "/sobre",
    brandPage: "/sobre-zacly",
    contactPage: "/contato",
    exampleQuote: "#exemplo",
    howItWorks: "#como-funciona",
    professions: "#profissoes",
    pricing: "#planos",
    faq: "#faq",
} as const;
