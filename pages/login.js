// pages/login.js
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Login = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/'); // Redirect to home if already logged in
    }
  }, [session, router]);

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github']}
          theme="dark"
        />
      ) : (
         // This will be shown briefly while redirecting
        <p>Redirecting...</p>
      )}
    </div>
  );
};

export default Login;
