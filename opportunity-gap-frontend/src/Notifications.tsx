
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Notifications.css";

type Notification = {
  notificationId: number;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string | null;
};

const API_URL = "http://localhost:8080/api/notifications";

function getUserId(): number | null {
  try {
    const user = JSON.parse(
      sessionStorage.getItem("opportunityGapUser") || "null"
    );
    return user?.userId ? Number(user.userId) : null;
  } catch {
    return null;
  }
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [actionLoading, setActionLoading] = useState(false);

  const userId = getUserId();

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setError("Please log in to view your notifications.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/user/${userId}`);

      if (!response.ok) {
        throw new Error("Unable to load notifications.");
      }

      const data: Notification[] = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const readCount = notifications.length - unreadCount;

  const categories = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        notifications
          .map((item) => item.notificationType?.trim())
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueTypes];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesReadFilter =
        filter === "all" || !item.isRead;

      const matchesCategory =
        selectedCategory === "All" ||
        item.notificationType === selectedCategory;

      return matchesReadFilter && matchesCategory;
    });
  }, [notifications, filter, selectedCategory]);

  const markAsRead = async (notificationId: number) => {
    if (!userId) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${notificationId}/read?userId=${userId}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Could not mark notification as read.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item.notificationId === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/user/${userId}/read-all`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Could not mark all notifications as read.");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const clearRead = async () => {
    if (!userId || readCount === 0) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/user/${userId}/clear-read`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Could not clear read notifications.");
      }

      setNotifications((current) =>
        current.filter((item) => !item.isRead)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getIcon = (type: string) => {
    const category = type?.toLowerCase() || "";

    if (category.includes("deadline")) return "⏰";
    if (category.includes("application")) return "📋";
    if (category.includes("opportunity")) return "🎯";
    if (category.includes("interview")) return "🤝";
    if (category.includes("scholarship")) return "🎓";

    return "🔔";
  };

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div>
          <p className="eyebrow">STAY INFORMED</p>
          <h1>Notifications</h1>
          <p>
            Important updates about your opportunities and applications.
          </p>
        </div>

        <div className="notification-count">
          <strong>{unreadCount}</strong>
          <span>Unread</span>
        </div>
      </header>

      <section className="notification-stats">
        {[
          { label: "Total", value: notifications.length },
          { label: "Unread", value: unreadCount },
          { label: "Read", value: readCount },
        ].map((item) => (
          <div className="notification-stat-card" key={item.label}>
            <span>{item.label}</span>
            <h2>{item.value}</h2>
          </div>
        ))}
      </section>

      <div className="notification-toolbar">
        <span>{filteredNotifications.length} notification(s)</span>

        <div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || actionLoading || loading}
          >
            Mark all as read
          </button>

          <button
            onClick={clearRead}
            disabled={readCount === 0 || actionLoading || loading}
          >
            Clear read
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <button
          className={filter === "all" ? "active-filter" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "unread" ? "active-filter" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="notification-error">
          {error}
        </p>
      )}

      {loading ? (
        <div className="notifications-empty">
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div>🔔</div>
          <h2>
            {filter === "unread"
              ? "No unread notifications"
              : "You're all caught up!"}
          </h2>
          <p>
            {filter === "unread"
              ? "You have read all your notifications."
              : "Opportunity updates and application reminders will appear here when available."}
          </p>
        </div>
      ) : (
        <div className="notification-list">
          {filteredNotifications.map((item) => {
            const isRead = item.isRead;

            return (
              <article
                key={item.notificationId}
                className={`notification-card ${
                  isRead ? "is-read" : "is-unread"
                }`}
              >
                <div className="notification-icon">
                  {getIcon(item.notificationType)}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{item.title}</h3>
                    {!isRead && <span className="unread-dot" />}
                  </div>

                  <p>{item.message}</p>

                  <span className="notification-date">
                    {item.notificationType || "Update"} ·{" "}
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {!isRead && (
                  <button
                    className="mark-read-button"
                    onClick={() => markAsRead(item.notificationId)}
                  >
                    Mark read
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
