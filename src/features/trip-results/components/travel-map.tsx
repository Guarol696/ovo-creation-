"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { memo, useEffect, useRef, useState } from "react";
import { publicEnv } from "@/lib/env";
import { cn, formatPrice } from "@/lib/utils";
import type { LocationCategory, PlanLocation, TripMap } from "@/types/travel-plan";

/**
 * Carte interactive (Leaflet, chargé uniquement côté navigateur).
 *
 * Performance : la carte et les marqueurs sont créés UNE fois par voyage.
 * Les changements de jour, de filtre ou de sélection ne font que modifier
 * des classes CSS et la visibilité des marqueurs existants.
 */

export const LOCATION_CATEGORIES: Record<LocationCategory, { label: string; emoji: string }> = {
  accommodation: { label: "Hébergement", emoji: "🏨" },
  activity: { label: "Activités", emoji: "🎯" },
  restaurant: { label: "Restaurants", emoji: "🍽️" },
  poi: { label: "Points d'intérêt", emoji: "🏛️" },
};

/** Au-delà de cette distance du centre (km), un lieu est hors de la ville (excursion). */
const CITY_RADIUS_KM = 12;

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function markerHtml(location: PlanLocation) {
  const day = location.dayNumbers[0];
  return `<span class="ovo-pin ovo-pin--${location.category}"><span class="ovo-pin__emoji" aria-hidden="true">${escapeHtml(location.emoji)}</span>${
    day ? `<span class="ovo-pin__day">J${day}</span>` : ""
  }</span>`;
}

function popupHtml(location: PlanLocation) {
  const days =
    location.dayNumbers.length > 0
      ? `Jour${location.dayNumbers.length > 1 ? "s" : ""} ${location.dayNumbers.join(", ")}`
      : location.category === "accommodation"
        ? "Pendant tout le séjour"
        : "Hors programme — idée en plus";
  const price =
    location.estimatedCostPerPerson === null
      ? ""
      : location.estimatedCostPerPerson === 0
        ? "Gratuit"
        : `≈ ${formatPrice(location.estimatedCostPerPerson)} / pers. (prix indicatif)`;
  return `
    <div style="min-width:min(180px,calc(100vw - 120px));max-width:min(240px,calc(100vw - 120px))">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-gold-300)">
        ${escapeHtml(LOCATION_CATEGORIES[location.category].label)} · ${escapeHtml(location.label)}
      </p>
      <p style="margin:4px 0 0;font-weight:700;font-size:15px">${escapeHtml(location.emoji)} ${escapeHtml(location.name)}</p>
      <p style="margin:6px 0 0;font-size:13px;color:var(--color-night-100)">${escapeHtml(location.description)}</p>
      <p style="margin:8px 0 0;font-size:12px;font-weight:600">${escapeHtml(days)}${price ? ` · ${escapeHtml(price)}` : ""}</p>
      <p style="margin:6px 0 0;font-size:12px;color:var(--color-night-200)">
        Donnée de démonstration${location.precision === "approximate" ? " · position approximative" : ""}
      </p>
    </div>`;
}

interface TravelMapProps {
  map: TripMap;
  visibleCategories: ReadonlySet<LocationCategory>;
  /** Jour mis en évidence (les autres lieux sont atténués). */
  activeDay: number | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

function TravelMapComponent({
  map,
  visibleCategories,
  activeDay,
  selectedId,
  onSelect,
  className,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markersRef = useRef(new Map<string, Leaflet.Marker>());
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  /** Recadrage courant (jour, filtres) : rejoué quand la carte redevient visible. */
  const refitRef = useRef<() => void>(() => {});
  /** Carte affichée avec une taille réelle (masquée sur mobile en mode « Itinéraire »). */
  const hasSize = () => {
    const el = containerRef.current;
    return Boolean(el && el.clientWidth > 0 && el.clientHeight > 0);
  };
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 1. Création de la carte et des marqueurs (une seule fois par voyage).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !map.center) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    const markers = markersRef.current;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;
      const instance = L.map(container, {
        center: [map.center!.lat, map.center!.lng],
        zoom: map.zoom,
        zoomControl: false,
        scrollWheelZoom: false,
      });
      L.control
        .zoom({ position: "bottomright", zoomInTitle: "Zoomer", zoomOutTitle: "Dézoomer" })
        .addTo(instance);
      L.tileLayer(publicEnv.mapTilesUrl, {
        attribution: publicEnv.mapAttribution,
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(instance);
      // Molette active seulement après un clic sur la carte (évite de piéger le défilement de la page).
      instance.on("click", () => instance.scrollWheelZoom.enable());
      instance.on("mouseout", () => instance.scrollWheelZoom.disable());

      for (const location of map.locations) {
        const marker = L.marker([location.point.lat, location.point.lng], {
          icon: L.divIcon({
            html: markerHtml(location),
            className: "ovo-marker",
            iconSize: [44, 44],
            iconAnchor: [22, 41],
            popupAnchor: [0, -38],
          }),
          title: location.name,
          alt: `${LOCATION_CATEGORIES[location.category].label} : ${location.name}`,
          keyboard: true,
          riseOnHover: true,
        });
        marker.bindPopup(popupHtml(location), { autoPanPadding: [16, 56] });
        marker.on("click", () => onSelectRef.current(location.id));
        // Fermer la popup du lieu sélectionné le désélectionne (pas celle d'un autre lieu).
        marker.on("popupclose", () => {
          if (selectedRef.current === location.id) onSelectRef.current(null);
        });
        markers.set(location.id, marker);
      }

      // Carte masquée puis affichée (onglet « Carte » sur mobile) : on recalcule sa taille
      // et on recadre, sinon Leaflet garde le cadrage calculé pour une carte de 0 px.
      let hidden = container.clientWidth === 0 || container.clientHeight === 0;
      resizeObserver = new ResizeObserver(([entry]) => {
        instance.invalidateSize();
        const nowHidden = !entry || entry.contentRect.width === 0 || entry.contentRect.height === 0;
        if (hidden && !nowHidden) refitRef.current();
        hidden = nowHidden;
      });
      resizeObserver.observe(container);
      mapRef.current = instance;
      setReady(true);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
      setReady(false);
    };
  }, [map]);

  // 2. Filtres et jour actif : visibilité et atténuation (sans recréer les marqueurs).
  useEffect(() => {
    const instance = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !instance || !L) return;

    const inFocus: Leaflet.LatLngExpression[] = [];
    for (const location of map.locations) {
      const marker = markersRef.current.get(location.id);
      if (!marker) continue;
      const visible = visibleCategories.has(location.category);
      if (visible && !instance.hasLayer(marker)) marker.addTo(instance);
      if (!visible && instance.hasLayer(marker)) marker.remove();

      const ofDay = activeDay === null || location.dayNumbers.includes(activeDay);
      const dimmed = location.category !== "accommodation" && !ofDay;
      marker.getElement()?.classList.toggle("is-dimmed", dimmed);
      marker.getElement()?.classList.toggle("is-selected", location.id === selectedRef.current);
      marker.setZIndexOffset(dimmed ? -500 : 0);
      if (visible && (ofDay || location.category === "accommodation")) {
        inFocus.push([location.point.lat, location.point.lng]);
      }
    }

    // Cadrage sur les lieux du jour (ou de la ville entière).
    const points =
      activeDay === null
        ? map.locations
            .filter((l) => map.center && distanceFromCenter(l, map) <= CITY_RADIUS_KM)
            .map((l) => [l.point.lat, l.point.lng] as Leaflet.LatLngExpression)
        : inFocus;
    const fit = (animate: boolean) => {
      const selected = selectedRef.current ? markersRef.current.get(selectedRef.current) : undefined;
      if (selected && instance.hasLayer(selected)) {
        instance.setView(selected.getLatLng(), Math.max(instance.getZoom(), 15), { animate });
        selected.openPopup();
      } else if (points.length > 1) {
        instance.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15, animate });
      } else if (points.length === 1) {
        instance.setView(points[0]!, 14, { animate });
      }
    };
    refitRef.current = () => fit(false);
    // Carte masquée : Leaflet ne peut pas calculer de cadrage (taille nulle), on recadrera à l'affichage.
    if (!hasSize()) return;
    instance.invalidateSize();
    if (points.length > 1) {
      instance.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15, animate: true });
    } else if (points.length === 1) {
      instance.setView(points[0]!, 14, { animate: true });
    }
  }, [ready, map, visibleCategories, activeDay]);

  // 3. Sélection : marqueur mis en évidence, carte centrée, popup ouverte.
  useEffect(() => {
    const instance = mapRef.current;
    selectedRef.current = selectedId;
    if (!ready || !instance) return;
    for (const [id, marker] of markersRef.current) {
      marker.getElement()?.classList.toggle("is-selected", id === selectedId);
    }
    if (!selectedId) {
      instance.closePopup();
      return;
    }
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;
    if (!instance.hasLayer(marker)) marker.addTo(instance);
    marker.setZIndexOffset(1000);
    // Carte encore masquée (bascule « Carte » en cours) : centrage et popup au moment de l'affichage.
    if (!hasSize()) return;
    instance.invalidateSize();
    instance.flyTo(marker.getLatLng(), Math.max(instance.getZoom(), 15), { duration: 0.6 });
    marker.openPopup();
  }, [ready, selectedId]);

  if (!map.available || !map.center) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl ring-1 ring-white/10", className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label="Carte interactive du voyage (données de démonstration)"
        className="ovo-map absolute inset-0"
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-night-900 text-sm text-night-100/70">
          Chargement de la carte…
        </div>
      )}
    </div>
  );
}

function distanceFromCenter(location: PlanLocation, map: TripMap) {
  const c = map.center!;
  const dLat = (location.point.lat - c.lat) * 111;
  const dLng = (location.point.lng - c.lng) * 111 * Math.cos((c.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Mémoïsé : la carte ne se re-rend que si ses props changent réellement. */
export const TravelMap = memo(TravelMapComponent);
