import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useVolunteerNotifications = () => {
  const [newCount, setNewCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;

    const channel = supabase
      .channel("volunteer-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "volunteers" },
        () => {
          setNewCount((prev) => prev + 1);
          audioRef.current?.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearCount = () => setNewCount(0);

  return { newCount, clearCount };
};
