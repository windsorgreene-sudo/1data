import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_LOCATIONS, enrichLocation, type Location } from "@/lib/locations";

let cached: Location[] | null = null;

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>(cached ?? DEFAULT_LOCATIONS);

  useEffect(() => {
    if (cached) return;
    let active = true;
    supabase
      .from("datacenter_locations")
      .select("name, region, latitude, longitude, is_primary_hub, status")
      .eq("status", "active")
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data || data.length === 0) {
          cached = DEFAULT_LOCATIONS;
          return;
        }
        const rows = data
          .filter((r) => Number.isFinite(Number(r.latitude)) && Number.isFinite(Number(r.longitude)))
          .map(enrichLocation);
        cached = rows.length ? rows : DEFAULT_LOCATIONS;
        setLocations(cached);
      })
      .then(undefined, () => {
        cached = DEFAULT_LOCATIONS;
      });
    return () => {
      active = false;
    };
  }, []);

  return locations;
};
