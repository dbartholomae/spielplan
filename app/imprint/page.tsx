'use client';

import { useI18n } from '../../lib/i18n';

export default function ImprintPage() {
  const { t, locale } = useI18n() as any;

  const NAME = 'Daniel Bartholomae';
  const ADDRESS = 'Wilhelmine-Gemberg-Weg 11\n10179 Berlin\nGermany';
  const EMAIL = 'hoppers_hedges.9b@icloud.com';
  const PHONE = '+49 30 20847337';
  const VATID = '';
  const RESPONSIBLE = NAME;

  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>{t('imprint.title')}</h1>
      </div>

      <section className="card">
        <div className="grid" style={{gap:8}}>
          <div className="group">
            <label className="small">{t('imprint.name')}</label>
            <div>{NAME}</div>
          </div>
          <div className="group">
            <label className="small">{t('imprint.address')}</label>
            <div style={{whiteSpace:'pre-line'}}>{ADDRESS}</div>
          </div>
          <div className="group">
            <label className="small">{t('imprint.email')}</label>
            <div>{EMAIL}</div>
          </div>
          <div className="group">
            <label className="small">{t('imprint.phone')}</label>
            <div>{PHONE}</div>
          </div>
          {VATID ? (
            <div className="group">
              <label className="small">{t('imprint.vatid')}</label>
              <div>{VATID}</div>
            </div>
          ) : null}
          <div className="group">
            <label className="small">{t('imprint.responsible')}</label>
            <div>{RESPONSIBLE}</div>
          </div>
          <div className="group">
            <label className="small">{t('imprint.dispute')}</label>
          </div>
        </div>
      </section>

      <section className="card">
        {locale === 'de' ? (
          <>
            <h2 style={{marginTop:0}}>Haftungsausschluss</h2>
            <h3>Haftung für Inhalte</h3>
            <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Nach den gesetzlichen Bestimmungen sind wir für eigene Inhalte auf diesen Seiten verantwortlich. Bitte beachten Sie in diesem Zusammenhang, dass wir nicht verpflichtet sind, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt (siehe §§ 8 bis 10 TMG).</p>
            <h3>Haftung für Links</h3>
            <p>Für Inhalte externer Links (zu Webseiten Dritter) ist ausschließlich der jeweilige Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße für uns erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
            <h3>Urheberrecht</h3>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Soweit nicht gesetzlich ausdrücklich erlaubt, bedarf jede Verwertung, Vervielfältigung oder Verarbeitung urheberrechtlich geschützter Werke auf unseren Seiten der vorherigen Zustimmung des jeweiligen Rechteinhabers. Einzelne Vervielfältigungen eines Werkes sind nur für den privaten Gebrauch gestattet. Die Inhalte dieser Seiten sind urheberrechtlich geschützt; jede nicht autorisierte Nutzung kann Urheberrechte verletzen.</p>
          </>
        ) : (
          <>
            <h2 style={{marginTop:0}}>Disclaimer</h2>
            <h3>Accountability for content</h3>
            <p>The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents' accuracy, completeness or topicality. According to statutory provisions, we are furthermore responsible for our own content on these web pages. In this matter, please note that we are not obliged to monitor the transmitted or saved information of third parties, or investigate circumstances pointing to illegal activity. Our obligations to remove or block the use of information under generally applicable laws remain unaffected by this as per §§ 8 to 10 of the Telemedia Act (TMG).</p>
            <h3>Accountability for links</h3>
            <p>Responsibility for the content of external links (to web pages of third parties) lies solely with the operators of the linked pages. No violations were evident to us at the time of linking. Should any legal infringement become known to us, we will remove the respective link immediately.</p>
            <h3>Copyright</h3>
            <p>Our web pages and their contents are subject to German copyright law. Unless expressly permitted by law, every form of utilizing, reproducing or processing works subject to copyright protection on our web pages requires the prior consent of the respective owner of the rights. Individual reproductions of a work are only allowed for private use. The materials from these pages are copyrighted and any unauthorized use may violate copyright laws.</p>
          </>
        )}
      </section>
    </main>
  );
}
