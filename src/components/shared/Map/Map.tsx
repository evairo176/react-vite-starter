import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---- base layers
const BASES = {
  esri: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  osm: {
    label: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  },
};

// ---- hotspot color
const getColor = (b: string) => {
  const val = parseFloat(b);
  if (val > 330) return "red";
  if (val > 310) return "orange";
  return "yellow";
};

export default function Map({ modisGeojson }: any) {
  const [base, setBase] = useState<keyof typeof BASES>("esri");

  return (
    <div className="relative w-full h-screen">
      <MapContainer center={[-2, 118]} zoom={5} className="w-full h-full">
        {/* BASE LAYER */}
        <TileLayer url={BASES[base].url} />

        {/* MODIS */}
        {modisGeojson && (
          <MarkerClusterGroup
            iconCreateFunction={(cluster: any) => {
              return L.divIcon({
                html: `<div style="
        background:red;
        color:white;
        border-radius:50%;
        width:40px;
        height:40px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        ${cluster.getChildCount()}
      </div>`,
                className: "custom-cluster",
                iconSize: [40, 40],
              });
            }}
          >
            <GeoJSON
              data={modisGeojson}
              pointToLayer={(f, latlng) =>
                L.circleMarker(latlng, {
                  radius: 6,
                  color: getColor(f.properties.brightness),
                })
              }
              onEachFeature={(feature, layer) => {
                const p = feature.properties;

                layer.bindPopup(`
      <div style="font:12px system-ui">
        <b>🔥 MODIS Hotspot</b><br/>
        Brightness: ${p.brightness ?? "-"}<br/>
        Confidence: ${p.confidence ?? "-"}<br/>
        Date: ${p.acq_date ?? "-"}<br/>
        Time: ${p.acq_time ?? "-"}
      </div>
    `);
              }}
            />
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* SIMPLE BASE SWITCH */}
      <div className="absolute top-3 left-12 z-[1000] bg-white shadow rounded-md flex">
        {Object.entries(BASES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setBase(key as any)}
            className={`px-3 py-1 text-sm ${
              base === key ? "bg-blue-500 text-white" : ""
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
}
