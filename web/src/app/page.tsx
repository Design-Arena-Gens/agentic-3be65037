"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type TabKey = "compose" | "schedule" | "preview" | "analytics";
type Platform = "Facebook" | "Instagram" | "Twitter" | "LinkedIn";

type MediaItem = {
  id: string;
  src: string;
  name: string;
  type: "image" | "video";
  alt: string;
  selected: boolean;
};

type ScheduledPost = {
  id: string;
  title: string;
  dayIndex: number;
  slotIndex: number;
  platforms: Platform[];
  status: "Scheduled" | "Draft";
};

const PLATFORM_LIMITS: Record<Platform, number> = {
  Facebook: 63206,
  Instagram: 2200,
  Twitter: 280,
  LinkedIn: 3000,
};

const HASHTAG_SUGGESTIONS = [
  "#BrandVoice",
  "#ContentStrategy",
  "#CustomerLove",
  "#LaunchDay",
  "#SocialFirst",
  "#TrendingNow",
  "#CommunityWins",
  "#EngagementTips",
  "#CreatorMode",
  "#GrowthHacks",
];

const TIME_SLOTS = ["Morning", "Midday", "Afternoon", "Evening"];

const createId = () => Math.random().toString(36).slice(2, 11);

const getPlainText = (html: string) => {
  if (typeof window === "undefined") {
    return html;
  }
  const parser = document.createElement("div");
  parser.innerHTML = html;
  return parser.textContent ?? "";
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatTrendLabel = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: createId(),
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    name: "Team sync",
    type: "image",
    alt: "Team collaborating around a table with sticky notes and laptops",
    selected: true,
  },
  {
    id: createId(),
    src: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80",
    name: "Customer story",
    type: "image",
    alt: "Person writing a note in a journal beside a tablet showing analytics",
    selected: true,
  },
  {
    id: createId(),
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    name: "Behind the scenes",
    type: "image",
    alt: "Content team filming a video in a studio environment",
    selected: false,
  },
];

const INITIAL_SCHEDULE: ScheduledPost[] = [
  {
    id: createId(),
    title: "Product roadmap AMA",
    dayIndex: 1,
    slotIndex: 2,
    platforms: ["LinkedIn", "Twitter"],
    status: "Scheduled",
  },
  {
    id: createId(),
    title: "Creator spotlight reel",
    dayIndex: 3,
    slotIndex: 1,
    platforms: ["Instagram", "Facebook"],
    status: "Scheduled",
  },
  {
    id: createId(),
    title: "Weekly wins roundup",
    dayIndex: 5,
    slotIndex: 0,
    platforms: ["Twitter"],
    status: "Draft",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("compose");
  const [postTitle, setPostTitle] = useState("Building authentic community connections");
  const [postLink, setPostLink] = useState("https://pulseteam.co/blog/community-connections");
  const [postHtml, setPostHtml] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [hashtagPool, setHashtagPool] = useState<string[]>(HASHTAG_SUGGESTIONS);
  const [customHashtag, setCustomHashtag] = useState("");
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [platformSelection, setPlatformSelection] = useState<Record<Platform, boolean>>({
    Facebook: true,
    Instagram: true,
    Twitter: true,
    LinkedIn: true,
  });
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULE);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const plainText = useMemo(() => getPlainText(postHtml), [postHtml]);
  const selectedPlatforms = useMemo(
    () => (Object.keys(platformSelection) as Platform[]).filter((item) => platformSelection[item]),
    [platformSelection],
  );

  const activeMedia = mediaLibrary.filter((item) => item.selected);

  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        label: formatDateLabel(date),
        raw: date,
      };
    });
  }, []);

  const analyticsCards = useMemo(
    () => [
      {
        label: "Total Engagement",
        value: "48.2K",
        trend: 12.4,
        detail: "vs. last 30 days",
      },
      {
        label: "Reach",
        value: "1.2M",
        trend: 7.9,
        detail: "Unique viewers",
      },
      {
        label: "Click-through rate",
        value: "3.8%",
        trend: 1.6,
        detail: "Link interactions",
      },
      {
        label: "Conversion assists",
        value: "642",
        trend: -2.1,
        detail: "Attributed goals",
      },
    ],
    [],
  );

  const platformPerformance = useMemo(
    () => [
      { platform: "Facebook" as const, completion: 68, color: "#2563eb" },
      { platform: "Instagram" as const, completion: 82, color: "#ec4899" },
      { platform: "Twitter" as const, completion: 54, color: "#38bdf8" },
      { platform: "LinkedIn" as const, completion: 74, color: "#0e76a8" },
    ],
    [],
  );

  const charProgress = (platform: Platform) => {
    const limit = PLATFORM_LIMITS[platform];
    const progress = limit === 0 ? 0 : Math.min(100, Math.round((plainText.length / limit) * 100));
    return progress;
  };

  const handlePlatformToggle = (platform: Platform) => {
    setPlatformSelection((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const applyFormatting = (command: string, value?: string) => {
    if (typeof document === "undefined") {
      return;
    }
    document.execCommand(command, false, value ?? "");
    if (editorRef.current) {
      setPostHtml(editorRef.current.innerHTML);
    }
  };

  const handleHashtagClick = (tag: string) => {
    setSelectedHashtags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      setPostHtml((prevHtml) => {
        const trimmed = prevHtml.trim();
        const needsSpace = trimmed.length > 0 && !/\s$/.test(trimmed);
        return `${trimmed}${needsSpace ? " " : ""}${tag}`;
      });

      return [...prev, tag];
    });
  };

  const handleHashtagAdd = () => {
    const cleaned = customHashtag.trim();
    if (!cleaned) return;
    const formatted = cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
    if (!hashtagPool.includes(formatted)) {
      setHashtagPool((prev) => [formatted, ...prev]);
    }
    handleHashtagClick(formatted);
    setCustomHashtag("");
  };

  const handleMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith("video/");
      const src = URL.createObjectURL(file);
      return {
        id: createId(),
        src,
        name: file.name,
        type: isVideo ? "video" : "image",
        alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        selected: true,
      };
    });

    setMediaLibrary((prev) => [...newItems, ...prev]);
    event.target.value = "";
  };

  const toggleMediaSelection = (id: string) => {
    setMediaLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const updateMediaAlt = (id: string, alt: string) => {
    setMediaLibrary((prev) => prev.map((item) => (item.id === id ? { ...item, alt } : item)));
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, postId: string) => {
    event.dataTransfer.setData("text/plain", postId);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>, slotKey: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveDropZone(slotKey);
  };

  const onDragLeave = (slotKey: string) => {
    setActiveDropZone((current) => (current === slotKey ? null : current));
  };

  const onDrop = (
    event: React.DragEvent<HTMLDivElement>,
    destination: { dayIndex: number; slotIndex: number },
  ) => {
    event.preventDefault();
    const postId = event.dataTransfer.getData("text/plain");
    if (!postId) return;

    setScheduledPosts((prev) =>
      prev.map((item) =>
        item.id === postId
          ? {
              ...item,
              dayIndex: destination.dayIndex,
              slotIndex: destination.slotIndex,
            }
          : item,
      ),
    );
    setActiveDropZone(null);
  };

  const handleReschedule = (id: string, field: "dayIndex" | "slotIndex", value: number) => {
    setScheduledPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, [field]: value } : post)),
    );
  };

  const tabContent = {
    compose: (
      <>
        <div className={styles.tabHeading}>
          <h2 className={styles.tabTitle}>Compose with clarity and confidence</h2>
          <p className={styles.tabDescription}>
            Craft multi-platform posts with a focused editor, real-time character guidance, and a media library optimized for accessibility.
          </p>
        </div>
        <div className={styles.twoColumn}>
          <section className={styles.card}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="post-title">
                Campaign headline
              </label>
              <input
                id="post-title"
                className={styles.input}
                value={postTitle}
                onChange={(event) => setPostTitle(event.target.value)}
                placeholder="Give your story a memorable headline"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="post-link">
                Link preview
              </label>
              <input
                id="post-link"
                className={styles.input}
                value={postLink}
                onChange={(event) => setPostLink(event.target.value)}
                placeholder="https://"
                type="url"
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Target platforms</span>
                <span className={styles.helper}>Tailor copy per network</span>
              </div>
              <div className={styles.platformGrid}>
                {(Object.keys(platformSelection) as Platform[]).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`${styles.platformToggle} ${
                      platformSelection[platform] ? styles.platformToggleActive : ""
                    }`}
                    aria-pressed={platformSelection[platform]}
                  >
                    <span className={styles.platformMeta}>
                      <span className={styles.platformName}>{platform}</span>
                      <span className={styles.platformLimit}>
                        {PLATFORM_LIMITS[platform].toLocaleString()} char limit
                      </span>
                    </span>
                    <span aria-hidden className={styles.platformCheck}>
                      {platformSelection[platform] ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.editorShell}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Rich text editor</span>
                <span className={styles.helper}>Use formatting to highlight key ideas</span>
              </div>

              <div className={styles.editorToolbar} role="toolbar" aria-label="Formatting options">
                <button
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => applyFormatting("bold")}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => applyFormatting("italic")}
                >
                  Italic
                </button>
                <button
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => applyFormatting("underline")}
                >
                  Underline
                </button>
                <button
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => applyFormatting("insertUnorderedList")}
                >
                  Bullets
                </button>
                <button
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => {
                    const url = window.prompt("Add a link URL");
                    if (url) {
                      applyFormatting("createLink", url);
                    }
                  }}
                >
                  Link
                </button>
              </div>

              <div
                ref={editorRef}
                className={styles.editor}
                role="textbox"
                aria-multiline
                data-placeholder="Start telling your story..."
                contentEditable
                suppressContentEditableWarning
                onInput={(event) =>
                  setPostHtml((event.target as HTMLDivElement).innerHTML ?? "")
                }
                onBlur={(event) =>
                  setPostHtml((event.target as HTMLDivElement).innerHTML ?? "")
                }
                dangerouslySetInnerHTML={{ __html: postHtml }}
              />
            </div>

            <div className={styles.hashtags}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Hashtag suggestions</span>
                <span className={styles.helper}>Tap to add directly to your post</span>
              </div>
              <div className={styles.hashtagList}>
                {hashtagPool.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.hashtag} ${
                      selectedHashtags.includes(tag) ? styles.hashtagSelected : ""
                    }`}
                    onClick={() => handleHashtagClick(tag)}
                    aria-pressed={selectedHashtags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.helper} htmlFor="custom-hashtag">
                  Add a custom hashtag
                </label>
                <div className={styles.ctaRow}>
                  <input
                    id="custom-hashtag"
                    className={styles.input}
                    value={customHashtag}
                    onChange={(event) => setCustomHashtag(event.target.value)}
                    placeholder="#InnovationDay"
                  />
                  <button type="button" className={styles.ctaSecondary} onClick={handleHashtagAdd}>
                    Add hashtag
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className={`${styles.card} ${styles.cardNeutral}`} aria-label="Media library">
            <div className={styles.mediaUpload}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Media library</span>
                <span className={styles.helper}>Attach up to 10 items per post</span>
              </div>
              <label className={styles.uploadField}>
                <span>Drop files or browse your library</span>
                <button type="button">Upload media</button>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="visually-hidden"
                  onChange={handleMediaUpload}
                />
              </label>
            </div>

            <div className={styles.mediaGrid}>
              {mediaLibrary.map((item) => (
                <div key={item.id} className={styles.mediaItem}>
                  {item.type === "video" ? (
                    <video className={styles.mediaThumb} controls aria-label={item.alt}>
                      <source src={item.src} />
                    </video>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.src} alt={item.alt} className={styles.mediaThumb} />
                  )}
                  <div className={styles.mediaMeta}>
                    <div className={styles.mediaMetaHeader}>
                      <span>{item.name}</span>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        className={styles.mediaToggle}
                        onChange={() => toggleMediaSelection(item.id)}
                        aria-label={item.selected ? "Remove from post" : "Attach to post"}
                      />
                    </div>
                    <label className={styles.helper} htmlFor={`alt-${item.id}`}>
                      Alt text
                    </label>
                    <input
                      id={`alt-${item.id}`}
                      className={styles.mediaAltInput}
                      value={item.alt}
                      onChange={(event) => updateMediaAlt(item.id, event.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Character guidance</h3>
              <div className={styles.characterList}>
                {selectedPlatforms.map((platform) => (
                  <div key={platform} className={styles.characterRow}>
                    <div className={styles.characterLabelRow}>
                      <strong>{platform}</strong>
                      <span>
                        {plainText.length}/{PLATFORM_LIMITS[platform].toLocaleString()} characters
                      </span>
                    </div>
                    <div className={styles.characterMeter} aria-hidden>
                      <div
                        className={styles.characterFill}
                        style={{ width: `${charProgress(platform)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {selectedPlatforms.length === 0 && (
                  <p className={styles.helper}>Select at least one platform to see guidance.</p>
                )}
              </div>
            </div>

            <div className={styles.ctaRow}>
              <button type="button" className={styles.ctaPrimary}>
                Schedule post
              </button>
              <button type="button" className={styles.ctaSecondary}>
                Publish now
              </button>
            </div>
          </aside>
        </div>
      </>
    ),
    schedule: (
      <>
        <div className={styles.tabHeading}>
          <h2 className={styles.tabTitle}>Plan your week at a glance</h2>
          <p className={styles.tabDescription}>
            Manage campaigns across platforms with drag-and-drop rescheduling and clear visibility
            into upcoming launches. Keyboard controls keep everything reachable.
          </p>
        </div>

        <div className={styles.calendar}>
          <div className={styles.scheduleLegend}>
            <span className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ backgroundColor: "rgba(37, 99, 235, 0.3)" }}
              />
              Scheduled
            </span>
            <span className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ backgroundColor: "rgba(196, 196, 196, 0.4)" }}
              />
              Empty slot
            </span>
            <span className={styles.legendItem}>Drag posts or use the selectors below each card.</span>
          </div>

          <div className={styles.calendarGrid} role="grid">
            <div className={styles.calendarHeader} role="columnheader">
              Time
            </div>
            {weekDays.map((day) => (
              <div key={day.label} className={styles.calendarHeader} role="columnheader">
                {day.label}
              </div>
            ))}

            {TIME_SLOTS.map((slotLabel, slotIndex) => (
              <div key={slotLabel} role="row" style={{ display: "contents" }}>
                <div className={styles.calendarCell} role="rowheader">
                  <span className={styles.slotLabel}>{slotLabel}</span>
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slotKey = `${dayIndex}-${slotIndex}`;
                  const itemsHere = scheduledPosts.filter(
                    (item) => item.dayIndex === dayIndex && item.slotIndex === slotIndex,
                  );
                  return (
                    <div key={day.label} className={styles.calendarCell} role="gridcell">
                      <div
                        className={`${styles.dropZone} ${
                          activeDropZone === slotKey ? styles.dropZoneActive : ""
                        }`}
                        onDragOver={(event) => onDragOver(event, slotKey)}
                        onDragLeave={() => onDragLeave(slotKey)}
                        onDrop={(event) => onDrop(event, { dayIndex, slotIndex })}
                        aria-label={`Drop posts for ${day.label} ${slotLabel}`}
                      >
                        {itemsHere.map((post) => (
                          <div
                            key={post.id}
                            className={styles.scheduledCard}
                            draggable
                            onDragStart={(event) => onDragStart(event, post.id)}
                            role="group"
                            aria-label={`${post.title} scheduled on ${day.label} ${slotLabel}`}
                          >
                            <div className={styles.scheduledTitle}>{post.title}</div>
                            <div className={styles.cardPlatforms}>
                              {post.platforms.map((platform) => (
                                <span key={platform}>{platform}</span>
                              ))}
                            </div>
                            <div className={styles.cardActions}>
                              <label className="visually-hidden" htmlFor={`day-${post.id}`}>
                                Reschedule day
                              </label>
                              <select
                                id={`day-${post.id}`}
                                className={styles.cardSelect}
                                value={post.dayIndex}
                                onChange={(event) =>
                                  handleReschedule(post.id, "dayIndex", Number(event.target.value))
                                }
                              >
                                {weekDays.map((option, index) => (
                                  <option value={index} key={option.label}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>

                              <label className="visually-hidden" htmlFor={`slot-${post.id}`}>
                                Reschedule time slot
                              </label>
                              <select
                                id={`slot-${post.id}`}
                                className={styles.cardSelect}
                                value={post.slotIndex}
                                onChange={(event) =>
                                  handleReschedule(post.id, "slotIndex", Number(event.target.value))
                                }
                              >
                                {TIME_SLOTS.map((slotName, index) => (
                                  <option value={index} key={slotName}>
                                    {slotName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    preview: (
      <>
        <div className={styles.tabHeading}>
          <h2 className={styles.tabTitle}>Preview every platform with confidence</h2>
          <p className={styles.tabDescription}>
            Ensure your copy, media, and calls to action feel native to each network before it
            reaches your audience.
          </p>
        </div>

        {selectedPlatforms.length === 0 ? (
          <div className={styles.emptyState}>
            Select at least one platform on the compose tab to generate previews.
          </div>
        ) : (
          <div className={styles.previewGrid}>
            {selectedPlatforms.map((platform) => (
              <article key={platform} className={styles.previewCard} aria-label={`${platform} preview`}>
                <header className={styles.previewHeader}>
                  <span className={styles.previewPlatform}>{platform}</span>
                  <span className={styles.previewMeta}>
                    {plainText.length}/{PLATFORM_LIMITS[platform].toLocaleString()} characters
                  </span>
                </header>
                <div className={styles.previewBody}>
                  <strong>{postTitle || "Your headline will appear here"}</strong>
                  <p>{plainText || "Start writing in the editor to see a live preview."}</p>
                  <a href={postLink || "#"} aria-label={`${platform} link preview`}>
                    {postLink || "Add a link to generate a preview."}
                  </a>
                  {activeMedia.length > 0 && (
                    <div className={styles.previewMedia}>
                      {activeMedia.map((item) =>
                        item.type === "video" ? (
                          <video
                            key={item.id}
                            controls
                            aria-label={item.alt}
                            preload="metadata"
                          >
                            <source src={item.src} />
                          </video>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={item.id} src={item.src} alt={item.alt} />
                        ),
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    ),
    analytics: (
      <>
        <div className={styles.tabHeading}>
          <h2 className={styles.tabTitle}>Understand performance at a glance</h2>
          <p className={styles.tabDescription}>
            PulseStream Studio tracks the metrics that matter—engagement, reach, and platform
            momentum—so you can iterate with clarity.
          </p>
        </div>

        <section className={styles.analyticsGrid} aria-label="Key metrics">
          {analyticsCards.map((card) => (
            <article key={card.label} className={styles.analyticsCard}>
              <span className={styles.metricLabel}>{card.label}</span>
              <span className={styles.metricValue}>{card.value}</span>
              <span
                className={`${styles.metricTrend} ${
                  card.trend >= 0 ? styles.trendPositive : styles.trendNegative
                }`}
              >
                {formatTrendLabel(card.trend)} {card.detail}
              </span>
              <div className={styles.progressBar} aria-hidden>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(100, Math.abs(card.trend) * 4)}%` }}
                />
              </div>
            </article>
          ))}
        </section>

        <section className={styles.analyticsGrid} aria-label="Platform performance">
          {platformPerformance.map((item) => (
            <article key={item.platform} className={styles.analyticsCard}>
              <span className={styles.metricLabel}>{item.platform}</span>
              <span className={styles.metricValue}>{item.completion}%</span>
              <p className={styles.tabDescription}>
                Campaign objective completion rate with week-over-week progress tracking.
              </p>
              <div className={styles.progressBar} aria-label={`${item.platform} completion`}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${item.completion}%`, background: item.color }}
                />
              </div>
            </article>
          ))}
        </section>
      </>
    ),
  };

  const tabOrder: { key: TabKey; label: string; description: string }[] = [
    { key: "compose", label: "Compose", description: "Write and refine posts" },
    { key: "schedule", label: "Schedule", description: "Plan your calendar" },
    { key: "preview", label: "Preview", description: "View platform layouts" },
    { key: "analytics", label: "Analytics", description: "Review performance" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.banner}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden>
                PS
              </span>
              <span className={styles.brandText}>
                <span className={styles.brandTitle}>PulseStream Studio</span>
                <span className={styles.brandSubtitle}>
                  Streamlined social storytelling for modern teams
                </span>
              </span>
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.headerButton}>
                Import calendar
              </button>
              <button type="button" className={`${styles.headerButton} ${styles.headerButtonPrimary}`}>
                Create new workspace
              </button>
            </div>
          </div>
        </header>

        <div role="tablist" aria-label="Workspace navigation" className={styles.tabBar}>
          {tabOrder.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-controls={`panel-${tab.key}`}
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              className={`${styles.tabButton} ${
                activeTab === tab.key ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={styles.tabPanel}
        >
          {tabContent[activeTab]}
        </section>
      </div>
    </div>
  );
}
