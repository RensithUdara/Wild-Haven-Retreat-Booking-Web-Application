import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  postcode: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, postcode")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          // Defer the Supabase call out of the auth callback
          setTimeout(() => loadProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) loadProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = useCallback(() => {
    if (user) return loadProfile(user.id);
    return Promise.resolve();
  }, [user, loadProfile]);

  return { user, session, profile, loading, signOut, refreshProfile };
};
