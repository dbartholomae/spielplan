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
  | 'auth.signInWithGoogle'
  | 'auth.signOut'
  | 'auth.guestMode'
  | 'auth.signInWithEmail'
  | 'auth.emailPlaceholder'
  | 'auth.sendMagicLink'
  | 'auth.magicLinkSent'
  | 'home.howItWorks'
  | 'home.simple'
  | 'home.pickGames'
  | 'home.setDates'
  | 'home.shareVote'
  | 'home.pickGamesHelp'
  | 'home.setDatesHelp'
  | 'home.shareVoteHelp'
  | 'home.loadError'
  | 'home.deleteConfirm'
  | 'home.deleteError'
  | 'series.yourEvents'
  | 'series.new'
  | 'series.none'
  | 'series.open'
  | 'series.delete'
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
  | 'create.createError'
  | 'public.titleFallback'
  | 'public.instructions'
  | 'public.games'
  | 'public.timeslots'
  | 'public.namePlaceholderOptional'
  | 'public.namePlaceholderRequired'
  | 'public.nameRequiredError'
  | 'public.saveAvailability'
  | 'public.saving'
  | 'public.saveSuccess'
  | 'public.shareLink'
  | 'public.loading'
  | 'public.notFound'
  | 'public.submitError'
  | 'owner.instructions'
  | 'owner.tableHeader'
  | 'owner.noVotesForCell'
  | 'owner.loadVotesError'
  | 'owner.participants'
  | 'owner.noParticipants'
  | 'results.title'
  | 'results.intro'
  | 'results.topGames'
  | 'results.topDates'
  | 'results.noVotes'
  | 'results.voteNow'
  | 'results.copyLink'
  | 'results.copied'
  | 'times.instructions'
  | 'times.singleDate'
  | 'times.start'
  | 'times.end'
  | 'times.addTimeslots'
  | 'times.clearSelection'
  | 'times.past'
  | 'footer.privacy'
  | 'footer.imprint'
  | 'terms.title'
  | 'terms.intro'
  | 'terms.liability'
  | 'terms.contact'
  | 'privacy.title'
  | 'privacy.intro'
  | 'privacy.data'
  | 'privacy.contact'
  | 'imprint.title'
  | 'imprint.name'
  | 'imprint.address'
  | 'imprint.email'
  | 'imprint.phone'
  | 'imprint.vatid'
  | 'imprint.responsible'
  | 'imprint.dispute'
  | 'imprint.missingNotice'
  ;

const en: Record<I18nKey, string> = {
  'app.title': 'GameNight Scheduler',
  'app.subtitle': 'The perfect way to coordinate board game nights with friends. Find the best time and games everyone wants to play!',
  'app.startPlanning': 'Start Planning',
  'auth.signInWithGitHub': 'Sign in with GitHub',
  'auth.signInWithGoogle': 'Sign in with Google',
  'auth.signOut': 'Sign out',
  'auth.guestMode': 'Guest mode',
  'auth.signInWithEmail': 'Sign in with email',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendMagicLink': 'Send magic link',
  'auth.magicLinkSent': 'Check your email for the sign-in link',
  'home.howItWorks': 'How It Works',
  'home.simple': 'Simple, fun, and designed for board game enthusiasts',
  'home.pickGames': '🎯 Pick Games',
  'home.setDates': '🗓️ Set Dates & Times',
  'home.shareVote': '📤 Share & Vote',
  'home.pickGamesHelp': 'Search BoardGameGeek and add one or more games for your night.',
  'home.setDatesHelp': 'Add a few options so everyone can choose what works.',
  'home.shareVoteHelp': 'Share a public link. Friends can vote without creating an account.',
  'home.loadError': 'Failed to load your event series.',
  'home.deleteConfirm': 'Delete this event series? This cannot be undone.',
  'home.deleteError': 'Failed to delete the event series. Please try again.',
  'series.yourEvents': 'Your Event Series',
  'series.new': 'New Event Series',
  'series.none': 'No event series yet. Click "New Event Series" to start.',
  'series.open': 'Open',
  'series.delete': 'Delete',
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
    'create.createError': 'Failed to create event series',
  'public.titleFallback': 'Board game night',
  'public.instructions': 'Pick the games you want to play and the timeslots you can join.',
  'public.games': 'Games',
  'public.timeslots': 'Timeslots',
  'public.namePlaceholderOptional': 'Your name (optional)',
  'public.namePlaceholderRequired': 'Your name (required)',
  'public.nameRequiredError': 'Please enter your name',
  'public.saveAvailability': 'Save my availability',
  'public.saving': 'Saving…',
  'public.saveSuccess': 'Your availability was saved. Thank you!',
  'public.shareLink': 'Share this link:',
  'public.loading': 'Loading…',
  'public.notFound': 'Series not found',
  'public.submitError': 'Failed to submit your choices',
  'owner.instructions': 'Current selections by game and timeslot. Click a cell to highlight matching participants below.',
  'owner.tableHeader': 'Timeslot \\ Game',
  'owner.noVotesForCell': 'No voters chose this combination yet.',
  'owner.loadVotesError': 'Failed to load votes.',
  'owner.participants': 'Participants',
  'owner.noParticipants': 'No participants yet.',
  'results.title': 'Current Results',
  'results.intro': 'Here are the current votes. Invite friends to vote to refine the plan.',
  'results.topGames': 'Most Voted Games',
  'results.topDates': 'Most Popular Dates',
  'results.noVotes': 'No votes yet. Be the first to vote!',
  'results.voteNow': 'Vote now',
  'results.copyLink': 'Copy voting link',
  'results.copied': 'Link copied!',
    'times.instructions': 'Pick a date in the next 7 weeks (Mon–Sun), then choose a time range and click "Add Timeslots".',
    'times.singleDate': 'Or pick a single date',
    'times.start': 'Start',
    'times.end': 'End',
    'times.addTimeslots': 'Add Timeslots',
    'times.clearSelection': 'Clear selection',
    'times.past': 'past',
      'footer.privacy': 'Privacy Policy',
      'footer.imprint': 'Imprint',
      'terms.title': 'Terms of Service',
      'terms.intro': 'By using this site, you agree to act respectfully and responsibly. This service is provided as-is without warranties.',
      'terms.liability': 'We are not liable for any damages arising from the use of this service.',
      'terms.contact': 'Questions about the terms? Contact the site owner.',
      'privacy.title': 'Privacy Policy',
      'privacy.intro': 'We only store the data necessary to run this service: the series you create, the games and timeslots you add, and the votes you and your participants submit. We do not sell your data.',
      'privacy.data': 'Data stored may include your Supabase user ID (if signed in), series titles, selected games and timeslots, and the names you provide with votes.',
      'privacy.contact': 'Questions? Contact the site owner.',
      'imprint.title': 'Imprint',
      'imprint.name': 'Name',
      'imprint.address': 'Address',
      'imprint.email': 'Email',
      'imprint.phone': 'Phone',
      'imprint.vatid': 'VAT ID',
      'imprint.responsible': 'Responsible for content (§ 55 RStV)',
      'imprint.dispute': 'Online dispute resolution: We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
      'imprint.missingNotice': 'Site owner: please provide your details so we can complete the Imprint.',
};

const de: Record<I18nKey, string> = {
  'app.title': 'Spieleabend-Planer',
  'app.subtitle': 'Die perfekte Art, Spieleabende mit Freunden zu koordinieren. Findet die beste Zeit und die Spiele, die alle spielen wollen!',
  'app.startPlanning': 'Jetzt planen',
  'auth.signInWithGitHub': 'Mit GitHub anmelden',
  'auth.signInWithGoogle': 'Mit Google anmelden',
  'auth.signOut': 'Abmelden',
  'auth.guestMode': 'Gastmodus',
  'auth.signInWithEmail': 'Mit E-Mail anmelden',
  'auth.emailPlaceholder': 'du@beispiel.de',
  'auth.sendMagicLink': 'Magic Link senden',
  'auth.magicLinkSent': 'Prüfe deine E-Mails für den Anmeldelink',
  'home.howItWorks': 'So funktioniert’s',
  'home.simple': 'Einfach, spaßig und für Brettspielfans gemacht',
  'home.pickGames': '🎯 Spiele auswählen',
  'home.setDates': '🗓️ Termine festlegen',
  'home.shareVote': '📤 Teilen & Abstimmen',
  'home.pickGamesHelp': 'Durchsuche BoardGameGeek und füge ein oder mehrere Spiele für euren Abend hinzu.',
  'home.setDatesHelp': 'Füge ein paar Optionen hinzu, damit alle wählen können, was passt.',
  'home.shareVoteHelp': 'Teile einen öffentlichen Link. Freunde können ohne Account abstimmen.',
  'home.loadError': 'Deine Terminreihen konnten nicht geladen werden.',
  'home.deleteConfirm': 'Diese Terminreihe löschen? Dies kann nicht rückgängig gemacht werden.',
  'home.deleteError': 'Die Terminreihe konnte nicht gelöscht werden. Bitte versuche es erneut.',
  'series.yourEvents': 'Deine Terminreihen',
  'series.new': 'Neue Terminreihe',
  'series.none': 'Noch keine Terminreihen. Klicke auf „Neue Terminreihe“, um zu starten.',
  'series.open': 'Öffnen',
  'series.delete': 'Löschen',
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
    'create.createError': 'Erstellen der Terminreihe fehlgeschlagen',
  'public.titleFallback': 'Spieleabend',
  'public.instructions': 'Wähle die Spiele aus, die du spielen möchtest, und die Zeiten, zu denen du kannst.',
  'public.games': 'Spiele',
  'public.timeslots': 'Zeitfenster',
  'public.namePlaceholderOptional': 'Dein Name (optional)',
  'public.namePlaceholderRequired': 'Dein Name (erforderlich)',
  'public.nameRequiredError': 'Bitte gib deinen Namen ein',
  'public.saveAvailability': 'Meine Verfügbarkeit speichern',
  'public.saving': 'Speichere…',
  'public.saveSuccess': 'Deine Verfügbarkeit wurde gespeichert. Danke!',
  'public.shareLink': 'Diesen Link teilen:',
  'public.loading': 'Lädt…',
  'public.notFound': 'Terminreihe nicht gefunden',
  'public.submitError': 'Speichern deiner Auswahl fehlgeschlagen',
  'owner.instructions': 'Aktuelle Auswahl nach Spiel und Zeitfenster. Klicke auf eine Zelle, um die passenden Teilnehmenden unten hervorzuheben.',
  'owner.tableHeader': 'Zeitfenster \\ Spiel',
  'owner.noVotesForCell': 'Noch niemand hat diese Kombination gewählt.',
  'owner.loadVotesError': 'Stimmen konnten nicht geladen werden.',
  'owner.participants': 'Teilnehmende',
  'owner.noParticipants': 'Noch keine Teilnehmenden.',
  'results.title': 'Aktuelle Ergebnisse',
  'results.intro': 'Hier sind die aktuellen Stimmen. Lade Freunde zum Abstimmen ein.',
  'results.topGames': 'Beliebteste Spiele',
  'results.topDates': 'Beliebteste Termine',
  'results.noVotes': 'Noch keine Stimmen. Sei die/der Erste!',
  'results.voteNow': 'Jetzt abstimmen',
  'results.copyLink': 'Abstimmungslink kopieren',
  'results.copied': 'Link kopiert!',
    'times.instructions': 'Wähle ein Datum in den nächsten 7 Wochen (Mo–So), dann Zeitraum wählen und auf „Zeitfenster hinzufügen“ klicken.',
    'times.singleDate': 'Oder ein einzelnes Datum wählen',
    'times.start': 'Start',
    'times.end': 'Ende',
    'times.addTimeslots': 'Zeitfenster hinzufügen',
    'times.clearSelection': 'Auswahl löschen',
    'times.past': 'vergangen',
      'footer.privacy': 'Datenschutzerklärung',
      'footer.imprint': 'Impressum',
      'terms.title': 'Nutzungsbedingungen',
      'terms.intro': 'Durch die Nutzung dieser Seite erklärst du dich zu einem respektvollen und verantwortungsvollen Verhalten bereit. Der Dienst wird ohne Gewähr bereitgestellt.',
      'terms.liability': 'Wir übernehmen keine Haftung für Schäden, die aus der Nutzung dieses Dienstes entstehen.',
      'terms.contact': 'Fragen zu den Nutzungsbedingungen? Wende dich an den Betreiber der Seite.',
      'privacy.title': 'Datenschutzerklärung',
      'privacy.intro': 'Wir speichern nur die Daten, die zum Betrieb dieses Dienstes notwendig sind: die von dir erstellten Reihen, die hinzugefügten Spiele und Zeitfenster sowie die von dir und Teilnehmenden abgegebenen Stimmen. Wir verkaufen keine Daten.',
      'privacy.data': 'Gespeicherte Daten können deine Supabase-Benutzer-ID (falls angemeldet), Reihen-Titel, ausgewählte Spiele und Zeitfenster sowie die bei Stimmen angegebenen Namen umfassen.',
      'privacy.contact': 'Fragen? Wende dich an den Betreiber der Seite.',
      'imprint.title': 'Impressum',
      'imprint.name': 'Name',
      'imprint.address': 'Anschrift',
      'imprint.email': 'E-Mail',
      'imprint.phone': 'Telefon',
      'imprint.vatid': 'USt-IdNr.',
      'imprint.responsible': 'Verantwortlich für den Inhalt (§ 55 RStV)',
      'imprint.dispute': 'Online-Streitbeilegung: Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      'imprint.missingNotice': 'Betreiber: Bitte trage deine Angaben ein, damit das Impressum vollständig ist.',
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
