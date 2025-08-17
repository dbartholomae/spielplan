import SupabaseStatus from '../components/SupabaseStatus';

export default function HomePage() {
  return (
    <main style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1>Hello, Next.js + Supabase 👋</h1>
      <p>Deployed on Vercel.</p>
      <SupabaseStatus />
    </main>
  );
}
