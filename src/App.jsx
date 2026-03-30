import { useState, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_KEY = "675ce2cb3c7fc999df65a13f7b9b234e";
const BASE = "https://api.openweathermap.org/data/2.5";
const DEMO = API_KEY === "YOUR_OPENWEATHERMAP_API_KEY";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const MOCK = {
  city: "Karachi",
  country: "PK",
  temp: 31,
  feels_like: 34,
  humidity: 72,
  wind: 5.2,
  description: "Partly Cloudy",
  icon: "02d",
  forecast: [
    { day: "Mon", high: 32, low: 27, icon: "02d", desc: "Partly Cloudy" },
    { day: "Tue", high: 30, low: 26, icon: "10d", desc: "Light Rain" },
    { day: "Wed", high: 28, low: 25, icon: "10d", desc: "Showers" },
    { day: "Thu", high: 33, low: 27, icon: "01d", desc: "Sunny" },
    { day: "Fri", high: 34, low: 28, icon: "01d", desc: "Clear" },
  ],
};

// ─── SVG WEATHER ICONS ────────────────────────────────────────────────────
const SunIcon = ({ size, night }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {night ? (
      <path
        d="M42 32c0 8.84-7.16 16-16 16A16 16 0 0126 4.29C20.08 7.22 16 13.16 16 20c0 8.84 7.16 16 16 16s16-7.16 16-16c0-2.88-.77-5.58-2-7.92A16.06 16.06 0 0142 32z"
        fill="#c9b8f0"
        opacity=".9"
      />
    ) : (
      <>
        <circle cx="32" cy="32" r="12" fill="#f9c74f" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="32"
            y1="8"
            x2="32"
            y2="14"
            stroke="#f9c74f"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${a} 32 32)`}
          />
        ))}
      </>
    )}
  </svg>
);

const PartlyCloudyIcon = ({ size, night }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle
      cx="24"
      cy="26"
      r="10"
      fill={night ? "#c9b8f0" : "#f9c74f"}
      opacity=".9"
    />
    <rect
      x="10"
      y="34"
      width="44"
      height="18"
      rx="9"
      fill="#e8dff8"
      opacity=".9"
    />
    <rect x="14" y="30" width="36" height="16" rx="8" fill="#f0eaff" />
  </svg>
);

const CloudIcon = ({ size, heavy }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x="8"
      y="28"
      width="48"
      height="22"
      rx="11"
      fill={heavy ? "#c9b8f0" : "#e0d4f8"}
      opacity=".9"
    />
    <rect
      x="14"
      y="22"
      width="36"
      height="18"
      rx="9"
      fill={heavy ? "#d4c4f4" : "#ede6ff"}
    />
  </svg>
);

const RainIcon = ({ size, heavy }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x="8"
      y="14"
      width="48"
      height="22"
      rx="11"
      fill="#c9b8f0"
      opacity=".9"
    />
    <rect x="14" y="10" width="36" height="18" rx="9" fill="#d8caff" />
    {(heavy ? [16, 24, 32, 40, 48] : [20, 32, 44]).map((x) => (
      <line
        key={x}
        x1={x}
        y1="42"
        x2={x - 4}
        y2="54"
        stroke="#9b7fe8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

const ThunderIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x="8"
      y="10"
      width="48"
      height="22"
      rx="11"
      fill="#a990d8"
      opacity=".9"
    />
    <rect x="14" y="6" width="36" height="18" rx="9" fill="#bfaee8" />
    <path d="M34 36 L28 48 L33 48 L26 58 L38 44 L32 44 Z" fill="#f9c74f" />
  </svg>
);

const SnowIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x="8"
      y="10"
      width="48"
      height="20"
      rx="10"
      fill="#e0d4f8"
      opacity=".9"
    />
    <rect x="14" y="6" width="36" height="16" rx="8" fill="#ede6ff" />
    {[16, 28, 40].map((x) => (
      <g key={x}>
        <circle cx={x} cy="44" r="3" fill="#b8a0e8" />
        <circle cx={x} cy="54" r="3" fill="#b8a0e8" opacity=".6" />
      </g>
    ))}
  </svg>
);

const MistIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {[20, 30, 40, 50].map((y, i) => (
      <rect
        key={y}
        x={8 + i * 2}
        y={y}
        width={48 - i * 4}
        height="4"
        rx="2"
        fill="#c4b0e0"
        opacity={0.7 - i * 0.1}
      />
    ))}
  </svg>
);

const WeatherIcon = ({ code, size = 64 }) => {
  const c = code || "01d";
  const night = c.endsWith("n");
  const icons = {
    "01": <SunIcon size={size} night={night} />,
    "02": <PartlyCloudyIcon size={size} night={night} />,
    "03": <CloudIcon size={size} />,
    "04": <CloudIcon size={size} heavy />,
    "09": <RainIcon size={size} heavy />,
    10: <RainIcon size={size} />,
    11: <ThunderIcon size={size} />,
    13: <SnowIcon size={size} />,
    50: <MistIcon size={size} />,
  };
  return icons[c.slice(0, 2)] || icons["01"];
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const getDayName = (timestamp) =>
  new Date(timestamp * 1000).toLocaleDateString("en", { weekday: "short" });

async function fetchWeather(city) {
  const [curr, fore] = await Promise.all([
    fetch(
      `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
    ).then((r) => {
      if (!r.ok) throw new Error("City not found");
      return r.json();
    }),
    fetch(
      `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
    ).then((r) => r.json()),
  ]);

  const days = {};
  fore.list.forEach((item) => {
    const d = getDayName(item.dt);
    if (!days[d])
      days[d] = {
        temps: [],
        icon: item.weather[0].icon,
        desc: item.weather[0].description,
      };
    days[d].temps.push(item.main.temp);
  });

  const forecast = Object.entries(days)
    .slice(0, 5)
    .map(([day, v]) => ({
      day,
      high: Math.round(Math.max(...v.temps)),
      low: Math.round(Math.min(...v.temps)),
      icon: v.icon,
      desc: v.desc,
    }));

  return {
    city: curr.name,
    country: curr.sys.country,
    temp: Math.round(curr.main.temp),
    feels_like: Math.round(curr.main.feels_like),
    humidity: curr.main.humidity,
    wind: curr.wind.speed,
    description: curr.weather[0].description,
    icon: curr.weather[0].icon,
    forecast,
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(DEMO ? MOCK : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(null);

  const search = useCallback(async (city) => {
    if (!city.trim()) return;
    if (DEMO) {
      setData({ ...MOCK, city: city.trim() || MOCK.city });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchWeather(city);
      setData(result);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const onKey = (e) => {
    if (e.key === "Enter") search(query);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4 py-8 sm:py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #f5f0ff 0%, #ecdeff 45%, #dfc8f8 100%)",
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="fixed top-[-100px] right-[-100px] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #d4b8f8 0%, transparent 70%)",
          opacity: 0.6,
        }}
      />
      <div
        className="fixed bottom-[-80px] left-[-80px] w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #c4a8ec 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        className="fixed top-1/2 left-[-60px] w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #e0c8ff 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 z-10">
        <h1
          className="text-3xl sm:text-4xl font-light tracking-[0.35em] uppercase m-0"
          style={{ color: "#6b4fa0", fontFamily: "'Georgia', serif" }}
        >
          Karmet
        </h1>
        <p
          className="text-[11px] tracking-[0.25em] mt-1.5"
          style={{ color: "#a080c8" }}
        >
          Weather at a Glance
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 w-full max-w-[340px] sm:max-w-[440px] mb-6 sm:mb-8 z-10">
        <input
          className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base outline-none transition-all duration-200 placeholder:opacity-50 shadow-sm"
          style={{
            border: "1.5px solid rgba(170,130,220,0.4)",
            background: "rgba(255,255,255,0.7)",
            color: "#5a3d8a",
            backdropFilter: "blur(12px)",
          }}
          placeholder="Search city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
        />
        <button
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #b090e0, #8b5cb8)" }}
          onClick={() => search(query)}
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs sm:text-sm text-center mb-4 z-10"
          style={{ color: "#c0547a" }}
        >
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p
          className="text-sm text-center py-8 z-10"
          style={{ color: "#a080c8" }}
        >
          Fetching weather…
        </p>
      )}

      {/* Weather Card */}
      {!loading && data && (
        <div
          className="w-full max-w-[340px] sm:max-w-[440px] rounded-3xl p-5 sm:p-8 z-10 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid rgba(190,155,235,0.35)",
            backdropFilter: "blur(28px)",
          }}
        >
          {/* City & Country */}
          <div className="flex items-baseline justify-between mb-0.5">
            <h2
              className="text-xl sm:text-3xl font-semibold m-0 truncate mr-2"
              style={{ color: "#5a3d8a", fontFamily: "'Georgia', serif" }}
            >
              {data.city}
            </h2>
            <span
              className="text-xs sm:text-sm font-normal shrink-0"
              style={{ color: "#a080c8" }}
            >
              {data.country}
            </span>
          </div>

          {/* Description */}
          <p
            className="text-xs sm:text-sm capitalize mb-4 sm:mb-6"
            style={{ color: "#b090cc" }}
          >
            {data.description}
          </p>

          {/* Temp + Icon */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-start">
              <span
                className="font-extralight leading-none"
                style={{
                  fontSize: "clamp(3rem, 16vw, 5.5rem)",
                  color: "#5a3d8a",
                }}
              >
                {data.temp}
              </span>
              <span
                className="text-xl sm:text-3xl font-light mt-1 sm:mt-2 ml-0.5"
                style={{ color: "#b090d8" }}
              >
                °C
              </span>
            </div>
            <WeatherIcon code={data.icon} size={72} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              { val: `${data.feels_like}°`, lbl: "Feels like" },
              { val: `${data.humidity}%`, lbl: "Humidity" },
              { val: `${data.wind}m/s`, lbl: "Wind" },
            ].map((s) => (
              <div
                key={s.lbl}
                className="rounded-2xl p-2 sm:p-3 text-center"
                style={{
                  background: "rgba(190,155,235,0.18)",
                  border: "1px solid rgba(190,155,235,0.3)",
                }}
              >
                <span
                  className="block text-sm sm:text-lg font-semibold"
                  style={{ color: "#7a52b0" }}
                >
                  {s.val}
                </span>
                <span
                  className="block text-[9px] sm:text-[11px] uppercase tracking-widest mt-0.5"
                  style={{ color: "#c0a0dc" }}
                >
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="h-px mb-4 sm:mb-5"
            style={{ background: "rgba(190,155,235,0.3)" }}
          />

          {/* 5-Day Forecast */}
          <p
            className="text-[9px] sm:text-[11px] uppercase tracking-[0.18em] mb-3 sm:mb-4"
            style={{ color: "#c0a0dc" }}
          >
            5-Day Forecast
          </p>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {data.forecast.map((f, i) => (
              <div
                key={f.day}
                className="flex flex-col items-center gap-1 rounded-xl py-2 sm:py-3 px-0.5 cursor-default transition-all duration-200"
                style={{
                  background:
                    hovered === i
                      ? "rgba(190,155,235,0.32)"
                      : "rgba(190,155,235,0.14)",
                  border: "1px solid rgba(190,155,235,0.25)",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: "#a080c8" }}
                >
                  {f.day}
                </span>
                <WeatherIcon code={f.icon} size={24} />
                <span
                  className="text-[11px] sm:text-sm font-bold"
                  style={{ color: "#5a3d8a" }}
                >
                  {f.high}°
                </span>
                <span
                  className="text-[9px] sm:text-xs"
                  style={{ color: "#c0a0dc" }}
                >
                  {f.low}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Notice */}
      {DEMO && (
        <p
          className="mt-5 sm:mt-6 text-[10px] sm:text-xs text-center leading-relaxed z-10 px-4"
          style={{ color: "#c0a0dc" }}
        >
          Demo mode — replace{" "}
          <code style={{ color: "#8b5cb8" }}>YOUR_OPENWEATHERMAP_API_KEY</code>
          <br />
          with your free key from openweathermap.org
        </p>
      )}
    </div>
  );
}
