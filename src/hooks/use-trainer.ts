'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trainer } from '@/lib/definitions';

export function useTrainer() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('trainers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setTrainer(data);
        }
      }
      setLoading(false);
    };

    fetchTrainer();
  }, []);

  return { trainer, loading };
}
