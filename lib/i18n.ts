export type Locale = 'en' | 'de';

// Simple browser locale detection with fallback to English
export function detectLocale(): Locale {
  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
    if (lang.startsWith('de')) return 'de';
  }
  return 'en';
}

// Keys used across the app. Keep alphabetical for clarity.
export type I18nKey =
  | 'app.title'
  | 'app.subtitle'
  | 'app.startPlanning'
  | 'auth.signInWithGitHub'
  | 'auth.signOut'
  | 'auth.guestMode'
  | 'home.howItWorks'
  | 'home.simple'
  | 'home.pickGames'
  | 'home.setDates'
  | 'home.shareVote'
  | 'series.yourEvents'
  | 'series.new'
  | 'series.none'
  | 'series.open'
  | 'series.more'
  | 'nav.back'
  | 'create.title'
  | 'create.details'
  | 'create.games'
  | 'create.times'
  | 'create.eventDetails'
  | 'create.eventTitleLabel'
  | 'create.eventTitlePlaceholder'
  | 'create.nextSelectGames'
  | 'create.previous'
  | 'create.nextSetTimes'
  | 'create.selectGamesTitle'
  | 'create.remove'
  | 'create.selectTimesTitle'
  | 'create.creating'
  | 'create.createSeries'
  | 'public.titleFallback'
  | 'public.instructions'
  | 'public.games'
  | 'public.timeslots'
  | 'public.namePlaceholderOptional'
  | 'public.namePlaceholderRequired'
  | 'public.saveAvailability'
  | 'public.saving'
  | 'public.shareLink'
  | 'public.loading'
  | 'public.notFound'
  | 'public.submitError'
  | 'results.title'
  | 'results.intro'
  | 'results.topGames'
  | 'results.topDates'
  | 'results.noVotes'
  | 'results.voteNow'
  | 'results.copyLink'
  | 'results.copied'
  ;

const en: Record<I18nKey, string> = {
  'app.title': 'GameNight Scheduler',
  'app.subtitle': 'The perfect way to coordinate board game nights with friends. Find the best time and games everyone wants to play!',
  'app.startPlanning': 'Start Planning',
  'auth.signInWithGitHub': 'Sign in with GitHub',
  'auth.signOut': 'Sign out',
  'auth.guestMode': 'Guest mode',
  'home.howItWorks': 'How It Works',
  'home.simple': 'Simple, fun, and designed for board game enthusiasts',
  'home.pickGames': '🎯 Pick Games',
  'home.setDates': '🗓️ Set Dates & Times',
  'home.shareVote': '📤 Share & Vote',
  'series.yourEvents': 'Your Event Series',
  'series.new': 'New Event Series',
  'series.none': 'No event series yet. Click "New Event Series" to start.',
  'series.open': 'Open',
  'series.more': 'more',
  'nav.back': '← Back',
  'create.title': 'Create New Event Series',
  'create.details': 'Details',
  'create.games': 'Games',
  'create.times': 'Times',
  'create.eventDetails': 'Event Details',
  'create.eventTitleLabel': 'Event Title',
  'create.eventTitlePlaceholder': 'e.g., Weekly Board Game Night',
  'create.nextSelectGames': 'Next: Select Games',
  'create.previous': 'Previous',
  'create.nextSetTimes': 'Next: Set Times',
  'create.selectGamesTitle': 'Select Board Games',
  'create.remove': 'Remove',
  'create.selectTimesTitle': 'Select Dates & Times',
  'create.creating': 'Creating…',
  'create.createSeries': 'Create Event Series',
  'public.titleFallback': 'Board game night',
  'public.instructions': 'Pick the games you want to play and the timeslots you can join.',
  'public.games': 'Games',
  'public.timeslots': 'Timeslots',
  'public.namePlaceholderOptional': 'Your name (optional)',
  'public.namePlaceholderRequired': 'Your name (required)',
  'public.saveAvailability': 'Save my availability',
  'public.saving': 'Saving…',
  'public.shareLink': 'Share this link:',
  'public.loading': 'Loading…',
  'public.notFound': 'Series not found',
  'public.submitError': 'Failed to submit your choices',
  'results.title': 'Current Results',
  'results.intro': 'Here are the current votes. Invite friends to vote to refine the plan.',
  'results.topGames': 'Most Voted Games',
  'results.topDates': 'Most Popular Dates',
  'results.noVotes': 'No votes yet. Be the first to vote!',
  'results.voteNow': 'Vote now',
  'results.copyLink': 'Copy voting link',
  'results.copied': 'Link copied!',
};

const de: Record<I18nKey, string> = {
  'app.title': 'Spieleabend-Planer',
  'app.subtitle': 'Die perfekte Art, Spieleabende mit Freunden zu koordinieren. Findet die beste Zeit und die Spiele, die alle spielen wollen!',
  'app.startPlanning': 'Jetzt planen',
  'auth.signInWithGitHub': 'Mit GitHub anmelden',
  'auth.signOut': 'Abmelden',
  'auth.guestMode': 'Gastmodus',
  'home.howItWorks': 'So funktioniert’s',
  'home.simple': 'Einfach, spaßig und für Brettspielfans gemacht',
  'home.pickGames': '🎯 Spiele auswählen',
  'home.setDates': '🗓️ Termine festlegen',
  'home.shareVote': '📤 Teilen & Abstimmen',
  'series.yourEvents': 'Deine Terminreihen',
  'series.new': 'Neue Terminreihe',
  'series.none': 'Noch keine Terminreihen. Klicke auf „Neue Terminreihe“, um zu starten.',
  'series.open': 'Öffnen',
  'series.more': 'mehr',
  'nav.back': '← Zurück',
  'create.title': 'Neue Terminreihe erstellen',
  'create.details': 'Details',
  'create.games': 'Spiele',
  'create.times': 'Zeiten',
  'create.eventDetails': 'Veranstaltungsdetails',
  'create.eventTitleLabel': 'Titel der Veranstaltung',
  'create.eventTitlePlaceholder': 'z. B. Wöchentlicher Spieleabend',
  'create.nextSelectGames': 'Weiter: Spiele auswählen',
  'create.previous': 'Zurück',
  'create.nextSetTimes': 'Weiter: Zeiten festlegen',
  'create.selectGamesTitle': 'Brettspiele auswählen',
  'create.remove': 'Entfernen',
  'create.selectTimesTitle': 'Daten & Zeiten auswählen',
  'create.creating': 'Erstelle…',
  'create.createSeries': 'Terminreihe erstellen',
  'public.titleFallback': 'Spieleabend',
  'public.instructions': 'Wähle die Spiele aus, die du spielen möchtest, und die Zeiten, zu denen du kannst.',
  'public.games': 'Spiele',
  'public.timeslots': 'Zeitfenster',
  'public.namePlaceholderOptional': 'Dein Name (optional)',
  'public.namePlaceholderRequired': 'Dein Name (erforderlich)',
  'public.saveAvailability': 'Meine Verfügbarkeit speichern',
  'public.saving': 'Speichere…',
  'public.shareLink': 'Diesen Link teilen:',
  'public.loading': 'Lädt…',
  'public.notFound': 'Terminreihe nicht gefunden',
  'public.submitError': 'Speichern fehlgeschlagen',
  'results.title': 'Aktuelle Ergebnisse',
  'results.intro': 'Hier sind die aktuellen Stimmen. Lade Freunde zum Abstimmen ein.',
  'results.topGames': 'Beliebteste Spiele',
  'results.topDates': 'Beliebteste Termine',
  'results.noVotes': 'Noch keine Stimmen. Sei die/der Erste!',
  'results.voteNow': 'Jetzt abstimmen',
  'results.copyLink': 'Abstimmungslink kopieren',
  'results.copied': 'Link kopiert!',
};

export function getStrings(locale: Locale): Record<I18nKey, string> {
  return locale === 'de' ? de : en;
}

export function t(key: I18nKey, locale?: Locale): string {
  const l = locale ?? detectLocale();
  const dict = getStrings(l);
  return dict[key] ?? key;
}

// A tiny hook for client components to memoize the locale and translator
export function useI18n() {
  const l = detectLocale();
  const dict = getStrings(l);
  const tr = (key: I18nKey) => dict[key] ?? key;
  return { locale: l, t: tr };
}
