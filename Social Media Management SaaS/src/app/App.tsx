import { useState, useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  Facebook,
  Instagram,
  Upload,
  Clock,
  Zap,
  ChevronRight,
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  Link2,
  MoreHorizontal,
  ImageIcon,
  Video,
  Trash2,
  Send,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Bell,
  Search,
  LogOut,
} from "lucide-react";

type Screen = "scheduler" | "calendar" | "settings";

// Blue: #1d6bf3   Sky: #0ea5e9   Navy: #0f1c35
const BLUE = "#1d6bf3";
const SKY = "#0ea5e9";

const PLATFORMS = [
  { id: "fb_page",   label: "Facebook Page",    icon: Facebook,  color: "#1877F2" },
  { id: "ig_feed",   label: "Instagram Feed",   icon: Instagram, color: "#E1306C" },
  { id: "fb_story",  label: "Facebook Story",   icon: Facebook,  color: "#1877F2" },
  { id: "ig_story",  label: "Instagram Story",  icon: Instagram, color: "#E1306C" },
];

const SCHEDULED_POSTS = [
  {
    id: 1,
    caption: "Summer sale is here! Grab 30% off everything in our store. Limited time only 🔥",
    platform: "Instagram Feed",
    platformColor: "#E1306C",
    date: "Jul 7, 2026",
    time: "10:00 AM",
    status: "scheduled",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 2,
    caption: "Behind the scenes of our new product shoot. The team worked incredibly hard on this one.",
    platform: "Facebook Page",
    platformColor: "#1877F2",
    date: "Jul 8, 2026",
    time: "2:30 PM",
    status: "scheduled",
    image: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 3,
    caption: "New arrivals just dropped. Shop the collection now — link in bio.",
    platform: "Instagram Feed",
    platformColor: "#E1306C",
    date: "Jul 9, 2026",
    time: "9:00 AM",
    status: "scheduled",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 4,
    caption: "Monday motivation: what are you building this week? Drop it below 👇",
    platform: "Facebook Story",
    platformColor: "#1877F2",
    date: "Jul 10, 2026",
    time: "8:00 AM",
    status: "draft",
    image: null,
  },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{
        background: checked ? BLUE : "#e2e8f0",
        boxShadow: checked ? `0 0 0 3px rgba(29,107,243,0.15)` : "none",
      }}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function MobilePreview({ caption, image, platforms }: { caption: string; image: string | null; platforms: string[] }) {
  const activePlatform = platforms.includes("ig_feed") || platforms.includes("ig_story") ? "instagram" : "facebook";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Preview</p>
      <div
        className="w-52 rounded-[2.25rem] border-[3px] border-slate-800 overflow-hidden flex flex-col bg-white"
        style={{ boxShadow: "0 20px 60px rgba(15,28,53,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
      >
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1 bg-slate-900">
          <div className="w-16 h-4 rounded-full bg-black" />
        </div>

        {/* App header */}
        <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-100 bg-white">
          {activePlatform === "instagram" ? (
            <Instagram size={13} style={{ color: "#E1306C" }} />
          ) : (
            <Facebook size={13} style={{ color: "#1877F2" }} />
          )}
          <span className="text-[10px] font-semibold text-slate-600">
            {activePlatform === "instagram" ? "Instagram" : "Facebook"}
          </span>
        </div>

        {/* Post */}
        <div className="px-3 py-2 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}
            />
            <div>
              <div className="text-[9px] font-semibold text-slate-800">YourBrand</div>
              <div className="text-[8px] text-slate-400">Scheduled</div>
            </div>
          </div>

          {image ? (
            <div className="rounded-lg overflow-hidden mb-2 bg-slate-100">
              <img src={image} alt="Post preview" className="w-full h-24 object-cover" />
            </div>
          ) : (
            <div className="rounded-lg h-24 mb-2 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200">
              <ImageIcon size={18} className="text-slate-300" />
            </div>
          )}

          <p className="text-[9px] leading-relaxed text-slate-600 line-clamp-3">
            {caption || "Your caption will appear here…"}
          </p>

          <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
            <span className="text-[8px] text-slate-400">♡ Like</span>
            <span className="text-[8px] text-slate-400">💬 Comment</span>
            <span className="text-[8px] text-slate-400">↗ Share</span>
          </div>
        </div>

        {/* Home bar */}
        <div className="h-5 bg-white flex items-end justify-center pb-1.5">
          <div className="w-16 h-1 rounded-full bg-slate-300" />
        </div>
      </div>

      {platforms.length === 0 && (
        <p className="text-[11px] text-slate-400 text-center max-w-[180px] mt-1">
          Select a platform above to preview your post
        </p>
      )}
    </div>
  );
}

function SchedulerScreen() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["ig_feed"]);
  const [date, setDate] = useState("2026-07-10");
  const [time, setTime] = useState("10:00");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFile = (file: File) => setImage(URL.createObjectURL(file));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left — Composer */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Caption */}
        <Card className="p-5">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something your audience will love…"
            rows={5}
            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-300 resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-1">
              <button className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 font-medium">
                # Hashtags
              </button>
              <button className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 font-medium">
                @ Mention
              </button>
            </div>
            <span className="text-[11px] font-mono text-slate-300">{caption.length} / 2200</span>
          </div>
        </Card>

        {/* Media */}
        <Card className="p-5">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
            Media
          </label>
          {image ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-100">
              <img src={image} alt="Upload preview" className="w-full h-48 object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-red-500 shadow-sm transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(29,107,243,0.08)", border: "1px solid rgba(29,107,243,0.15)" }}
              >
                <Upload size={18} style={{ color: BLUE }} />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 font-medium">Drop a photo or video here</p>
                <p className="text-xs text-slate-400 mt-0.5">or click to browse · PNG, JPG, MP4 up to 100MB</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                  <ImageIcon size={10} /> Photo
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                  <Video size={10} /> Video
                </span>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </Card>

        {/* Platforms */}
        <Card className="p-5">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
            Publish To
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200"
                  style={{
                    border: active ? `1.5px solid ${BLUE}40` : "1.5px solid #e2e8f0",
                    background: active ? `${BLUE}08` : "transparent",
                  }}
                >
                  <p.icon size={16} style={{ color: active ? p.color : "#94a3b8" }} />
                  <span className={`text-sm font-medium ${active ? "text-slate-800" : "text-slate-400"}`}>
                    {p.label}
                  </span>
                  <div className="ml-auto">
                    <Toggle checked={active} onChange={() => togglePlatform(p.id)} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-5">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
            Schedule
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Time</p>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          style={{
            background: `linear-gradient(135deg, ${BLUE} 0%, ${SKY} 100%)`,
            boxShadow: `0 8px 24px rgba(29,107,243,0.3)`,
          }}
        >
          <Send size={16} />
          Schedule Post
        </button>
      </div>

      {/* Right — Preview */}
      <div className="w-68 flex-shrink-0" style={{ width: "272px" }}>
        <Card className="p-6 sticky top-0">
          <MobilePreview caption={caption} image={image} platforms={selectedPlatforms} />
        </Card>
      </div>
    </div>
  );
}

function CalendarScreen() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [7, 8, 9, 10, 11, 12, 13];
  const today = 7;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Scheduled This Week", value: "3", sub: "of 5 free posts", icon: Clock, color: BLUE, bg: "rgba(29,107,243,0.08)", border: "rgba(29,107,243,0.18)" },
          { label: "Total Reach", value: "12.4K", sub: "+18% vs last week", icon: TrendingUp, color: SKY, bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.18)" },
          { label: "Engagement Rate", value: "4.7%", sub: "Above average", icon: BarChart3, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.18)" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5 flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {stat.label === "Total Reach" && <ArrowUpRight size={10} style={{ color: SKY }} />}
                {stat.sub}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Upgrade widget */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{
          background: `linear-gradient(135deg, rgba(29,107,243,0.07) 0%, rgba(14,165,233,0.05) 100%)`,
          border: `1px solid rgba(29,107,243,0.2)`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(29,107,243,0.12)", border: "1px solid rgba(29,107,243,0.2)" }}
        >
          <Zap size={18} style={{ color: BLUE }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 mb-1.5">3 of 5 free posts used this week</p>
          <div className="w-full h-1.5 rounded-full bg-blue-100">
            <div
              className="h-full w-[60%] rounded-full"
              style={{ background: `linear-gradient(90deg, ${BLUE}, ${SKY})` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Upgrade for unlimited posts, advanced analytics & more.</p>
        </div>
        <button
          className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})`, boxShadow: `0 4px 16px rgba(29,107,243,0.3)` }}
        >
          Upgrade to Pro
        </button>
      </div>

      {/* Weekly calendar */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-700">Week of July 7 – 13, 2026</h3>
          <div className="flex gap-2">
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-white"
              style={{ background: BLUE }}
            >
              Week
            </button>
            <button className="text-xs font-medium text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              List
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const postsOnDay = SCHEDULED_POSTS.filter((p) => {
              const d = parseInt(p.date.split(" ")[1].replace(",", ""));
              return d === dates[i];
            });
            return (
              <div key={day} className="flex flex-col gap-2">
                <div className="text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">{day}</p>
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition-all`}
                    style={
                      dates[i] === today
                        ? { background: `linear-gradient(135deg, ${BLUE}, ${SKY})`, color: "#fff", boxShadow: `0 4px 12px rgba(29,107,243,0.35)` }
                        : { color: "#64748b" }
                    }
                  >
                    {dates[i]}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 min-h-[80px]">
                  {postsOnDay.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg p-2 cursor-pointer hover:shadow-sm transition-all"
                      style={{
                        background: `${post.platformColor}10`,
                        border: `1px solid ${post.platformColor}25`,
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: post.platformColor }} />
                        <span className="text-[8px] font-mono text-slate-400">{post.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-600 leading-tight line-clamp-2">{post.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming list */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Upcoming Posts</h3>
        <div className="flex flex-col gap-2">
          {SCHEDULED_POSTS.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {post.image ? (
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={14} className="text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate font-medium">{post.caption}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${post.platformColor}15`, color: post.platformColor }}
                  >
                    {post.platform}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{post.date} · {post.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
                    post.status === "scheduled"
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-400 bg-slate-100"
                  }`}
                >
                  {post.status}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SettingsScreen() {
  const [fbConnected, setFbConnected] = useState(true);
  const [igConnected, setIgConnected] = useState(false);
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex@yourbrand.com");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Profile */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <User size={15} className="text-slate-400" /> Profile
        </h3>
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})`, boxShadow: `0 6px 20px rgba(29,107,243,0.25)` }}
          >
            {name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{name}</p>
            <p className="text-sm text-slate-400">{email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
              Free Plan
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: BLUE, boxShadow: `0 4px 12px rgba(29,107,243,0.25)` }}
          >
            Save Changes
          </button>
        </div>
      </Card>

      {/* Integrations */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <Link2 size={15} className="text-slate-400" /> Connected Accounts
        </h3>
        <p className="text-xs text-slate-400 mb-5">Connect your social accounts to start scheduling posts.</p>

        <div className="flex flex-col gap-3">
          {/* Facebook */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border transition-all"
            style={{
              border: fbConnected ? "1.5px solid rgba(24,119,242,0.3)" : "1.5px solid #e2e8f0",
              background: fbConnected ? "rgba(24,119,242,0.04)" : "transparent",
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1877F2" }}>
              <Facebook size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Facebook Page</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {fbConnected ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-medium">Connected · YourBrand Page</span>
                  </>
                ) : (
                  <>
                    <XCircle size={11} className="text-slate-300" />
                    <span className="text-[11px] text-slate-400">Not connected</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setFbConnected(!fbConnected)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                fbConnected
                  ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500"
                  : "text-white"
              }`}
              style={!fbConnected ? { background: "#1877F2", boxShadow: "0 4px 12px rgba(24,119,242,0.3)" } : {}}
            >
              {fbConnected ? "Disconnect" : "Connect Facebook"}
            </button>
          </div>

          {/* Instagram */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border transition-all"
            style={{
              border: igConnected ? "1.5px solid rgba(225,48,108,0.3)" : "1.5px solid #e2e8f0",
              background: igConnected ? "rgba(225,48,108,0.04)" : "transparent",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
            >
              <Instagram size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Instagram Business</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {igConnected ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-medium">Connected · @yourbrand</span>
                  </>
                ) : (
                  <>
                    <XCircle size={11} className="text-slate-300" />
                    <span className="text-[11px] text-slate-400">Not connected</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setIgConnected(!igConnected)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                igConnected
                  ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500"
                  : "text-white"
              }`}
              style={
                !igConnected
                  ? { background: "linear-gradient(135deg, #e6683c, #dc2743, #bc1888)", boxShadow: "0 4px 12px rgba(225,48,108,0.3)" }
                  : {}
              }
            >
              {igConnected ? "Disconnect" : "Connect Instagram"}
            </button>
          </div>
        </div>
      </Card>

      {/* Billing */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <CreditCard size={15} className="text-slate-400" /> Billing & Plan
        </h3>
        <p className="text-xs text-slate-400 mb-5">Manage your subscription and payment details.</p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">Free Plan</p>
            <p className="text-xs text-slate-400">5 posts/week · 2 social accounts · Basic analytics</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">$0 / mo</span>
        </div>

        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, rgba(29,107,243,0.07), rgba(14,165,233,0.05))`,
            border: `1.5px solid rgba(29,107,243,0.2)`,
          }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 mb-0.5">Upgrade to Post 2 Post Pro</p>
            <p className="text-xs text-slate-500">Unlimited posts · 10 accounts · Priority support · Advanced analytics</p>
          </div>
          <button
            className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})`, boxShadow: `0 4px 16px rgba(29,107,243,0.3)` }}
          >
            Upgrade — $19/mo
          </button>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">Account</h3>
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors px-4 py-2.5 rounded-xl hover:bg-red-50 border border-slate-200 hover:border-red-200">
          <LogOut size={14} />
          Sign out of Post 2 Post
        </button>
      </Card>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("scheduler");

  const navItems = [
    { id: "scheduler" as Screen, label: "Composer",  icon: LayoutDashboard },
    { id: "calendar"  as Screen, label: "Calendar",  icon: CalendarDays },
    { id: "settings"  as Screen, label: "Settings",  icon: Settings },
  ];

  const screenTitle: Record<Screen, string> = {
    scheduler: "New Post",
    calendar: "Scheduled Posts",
    settings: "Account & Settings",
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#f0f4fa]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 z-10 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})`, boxShadow: `0 4px 12px rgba(29,107,243,0.35)` }}
            >
              <Send size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight">Post 2 Post</p>
              <p className="text-[10px] text-slate-400 font-mono">v1.0 · Free Plan</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">Navigation</p>
          {navItems.map((item) => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full"
                style={
                  active
                    ? { background: "rgba(29,107,243,0.08)", border: "1.5px solid rgba(29,107,243,0.18)", color: BLUE }
                    : { border: "1.5px solid transparent", color: "#94a3b8" }
                }
              >
                <item.icon
                  size={16}
                  style={{ color: active ? BLUE : "#cbd5e1" }}
                />
                <span className={active ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}>
                  {item.label}
                </span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: BLUE }} />}
              </button>
            );
          })}
        </nav>

        {/* Usage widget */}
        <div className="p-4 border-t border-slate-100">
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(29,107,243,0.06)", border: "1px solid rgba(29,107,243,0.15)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-600">Weekly Posts</p>
              <p className="text-[11px] font-mono text-slate-500">3 / 5</p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-blue-100 mb-3">
              <div
                className="h-full w-[60%] rounded-full"
                style={{ background: `linear-gradient(90deg, ${BLUE}, ${SKY})` }}
              />
            </div>
            <button
              className="text-[10px] font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: BLUE }}
            >
              <Zap size={10} /> Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{screenTitle[screen]}</h1>
            <p className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <Search size={15} />
            </button>
            <button className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: BLUE }} />
            </button>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}
            >
              AM
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-7" style={{ scrollbarWidth: "none" }}>
          {screen === "scheduler" && <SchedulerScreen />}
          {screen === "calendar"  && <CalendarScreen />}
          {screen === "settings"  && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}
