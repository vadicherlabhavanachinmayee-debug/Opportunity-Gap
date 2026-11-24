
import { useEffect, useMemo, useState } from "react";
import "./Explore.css";

export type Opportunity = {
  id: number;
  title: string;
  organization: string;
  category: string;
  location: string;
  deadline: string;
  description: string;
  eligibility: string;
  documents: string[];
  skills: string[];
  applicationUrl: string;
};

type ApiOpportunity = {
  opportunityId: number;
  title: string;
  organization: string;
  opportunityType: string;
  location: string;
  deadline: string | null;
  description: string;
  eligibilityCriteria: string;
  requiredDocuments: string;
  applicationUrl: string;
};

type SavedOpportunityResponse = {
  opportunityId: number;
};

type ExistingApplication = {
  title: string;
  organization: string;
};

export const SAVED_OPPORTUNITIES_KEY = "opportunityGapSaved";

const API_URL = "http://localhost:8080/api/opportunities";
const SAVED_API_URL = "http://localhost:8080/api/saved-opportunities";
const APPLICATION_API_URL = "http://localhost:8080/api/applications";

const categories = [
  "All",
  "Jobs",
  "Scholarships",
  "Internships",
  "Government Schemes",
];

function formatDeadline(date: string | null): string {
  if (!date) return "Not specified";

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function splitItems(value?: string): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapOpportunity(item: ApiOpportunity): Opportunity {
  return {
    id: item.opportunityId,
    title: item.title,
    organization: item.organization || "Not specified",
    category: item.opportunityType || "Other",
    location: item.location || "Not specified",
    deadline: formatDeadline(item.deadline),
    description: item.description || "No description available.",
    eligibility: item.eligibilityCriteria || "Not specified",
    documents: splitItems(item.requiredDocuments),
    skills: [],
    applicationUrl: item.applicationUrl || "",
  };
}

function getLoggedInUserId(): number | null {
  try {
    const userData = sessionStorage.getItem("opportunityGapUser");
    if (!userData) return null;

    const userId = Number(JSON.parse(userData).userId);
    return userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

function Explore() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");

  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);

  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [applyingIds, setApplyingIds] = useState<number[]>([]);

  // Load opportunities from MySQL.
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not fetch opportunities.");
        }

        const data: ApiOpportunity[] = await response.json();
        setOpportunities(data.map(mapOpportunity));
      } catch {
        setError(
          "Unable to load opportunities. Please check whether the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Load saved opportunity IDs for the logged-in user.
  useEffect(() => {
    const loadSavedIds = async () => {
      try {
        const userId = getLoggedInUserId();
        if (!userId) return;

        const response = await fetch(
          `${SAVED_API_URL}/user/${userId}`
        );

        if (!response.ok) {
          throw new Error("Could not load saved opportunities.");
        }

        const data: SavedOpportunityResponse[] = await response.json();
        setSavedIds(data.map((item) => item.opportunityId));
      } catch (error) {
        console.error("Saved opportunities loading error:", error);
      }
    };

    loadSavedIds();
  }, []);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(
        opportunities
          .map((item) => item.location)
          .filter(
            (item) => item && item !== "Not specified"
          )
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...uniqueLocations];
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    let results = opportunities.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.organization.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesLocation =
        location === "All" || item.location === location;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    results = [...results].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "organization") {
        return a.organization.localeCompare(b.organization);
      }

      if (sortBy === "deadline") {
        const dateA =
          a.deadline === "Not specified"
            ? Number.MAX_SAFE_INTEGER
            : new Date(a.deadline).getTime();

        const dateB =
          b.deadline === "Not specified"
            ? Number.MAX_SAFE_INTEGER
            : new Date(b.deadline).getTime();

        return dateA - dateB;
      }

      return 0;
    });

    return results;
  }, [opportunities, search, category, location, sortBy]);

  const isSaved = (id: number) => savedIds.includes(id);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setSortBy("deadline");
  };

  // Save or remove an opportunity using the backend.
  const toggleSave = async (opportunity: Opportunity) => {
    const userId = getLoggedInUserId();

    if (!userId) {
      alert("Please log in first.");
      return;
    }

    if (savingIds.includes(opportunity.id)) return;

    try {
      setSavingIds((previous) => [...previous, opportunity.id]);

      if (isSaved(opportunity.id)) {
        const response = await fetch(
          `${SAVED_API_URL}?userId=${userId}&opportunityId=${opportunity.id}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error("Could not remove saved opportunity.");
        }

        setSavedIds((previous) =>
          previous.filter((id) => id !== opportunity.id)
        );
      } else {
        const response = await fetch(
          `${SAVED_API_URL}?userId=${userId}&opportunityId=${opportunity.id}`,
          { method: "POST" }
        );

        if (!response.ok) {
          throw new Error("Could not save opportunity.");
        }

        setSavedIds((previous) =>
          previous.includes(opportunity.id)
            ? previous
            : [...previous, opportunity.id]
        );
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSavingIds((previous) =>
        previous.filter((id) => id !== opportunity.id)
      );
    }
  };

  // Track the opportunity in My Applications and open its application link.
  const applyToOpportunity = async (opportunity: Opportunity) => {
    const userId = getLoggedInUserId();

    if (!userId) {
      alert("Please log in first.");
      return;
    }

    if (applyingIds.includes(opportunity.id)) return;

    if (!opportunity.applicationUrl) {
      alert("Application link is not available.");
      return;
    }

    // Open the employer link immediately to avoid browser popup blocking.
   const rawUrl = opportunity.applicationUrl.trim();

const applicationUrl = /^https?:\/\//i.test(rawUrl)
  ? rawUrl
  : `https://${rawUrl}`;

const newTab = window.open(
  applicationUrl,
  "_blank",
  "noopener,noreferrer"
);

if (!newTab) {
  alert("Your browser blocked the new tab. Please allow pop-ups.");
  return;
}

    try {
      setApplyingIds((previous) => [...previous, opportunity.id]);

      // Check whether this opportunity is already being tracked.
      const existingResponse = await fetch(
        `${APPLICATION_API_URL}/user/${userId}`
      );

      if (!existingResponse.ok) {
        throw new Error("Could not check your existing applications.");
      }

      const existingApplications: ExistingApplication[] =
        await existingResponse.json();

      const alreadyTracked = existingApplications.some(
        (application) =>
          application.title?.trim().toLowerCase() ===
            opportunity.title.trim().toLowerCase() &&
          application.organization?.trim().toLowerCase() ===
            opportunity.organization.trim().toLowerCase()
      );

      if (alreadyTracked) {
        alert(
          "This opportunity is already in My Applications. The application link has been opened."
        );
        return;
      }

      const today = new Date();
      const applicationDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const response = await fetch(APPLICATION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: opportunity.title,
          organization: opportunity.organization,
          applicationDate,
          status: "Applied",
        }),
      });

      if (!response.ok) {
        throw new Error("Could not add this opportunity to My Applications.");
      }

      alert(
        "Opportunity added to My Applications! Complete your application on the employer's website."
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while tracking your application."
      );
    } finally {
      setApplyingIds((previous) =>
        previous.filter((id) => id !== opportunity.id)
      );
    }
  };

  if (selectedOpportunity) {
    const item = selectedOpportunity;

    return (
      <div className="explore-page">
        <button
          className="back-button"
          onClick={() => setSelectedOpportunity(null)}
        >
          ← Back to Opportunities
        </button>

        <div className="details-page">
          <div className="details-top">
            <span className="opportunity-category">{item.category}</span>

            <button
              className={isSaved(item.id) ? "save-button saved" : "save-button"}
              onClick={() => toggleSave(item)}
              disabled={savingIds.includes(item.id)}
            >
              {savingIds.includes(item.id)
                ? "Saving..."
                : isSaved(item.id)
                  ? "♥ Saved"
                  : "♡ Save Opportunity"}
            </button>
          </div>

          <p className="explore-label">OPPORTUNITY DETAILS</p>
          <h1>{item.title}</h1>
          <h3 className="details-organization">{item.organization}</h3>

          <p className="details-description">{item.description}</p>

          <div className="details-info-grid">
            <div>
              <span>LOCATION</span>
              <strong>{item.location}</strong>
            </div>

            <div>
              <span>APPLICATION DEADLINE</span>
              <strong>{item.deadline}</strong>
            </div>

            <div>
              <span>CATEGORY</span>
              <strong>{item.category}</strong>
            </div>
          </div>

          <div className="details-section">
            <h2>Eligibility Requirements</h2>
            <p>{item.eligibility}</p>
          </div>

          <div className="details-section">
            <h2>Required Documents</h2>

            {item.documents.length > 0 ? (
              <ul>
                {item.documents.map((document) => (
                  <li key={document}>{document}</li>
                ))}
              </ul>
            ) : (
              <p>Not specified.</p>
            )}
          </div>

          <div className="details-section">
            <h2>Required Skills</h2>
            <p>
              Skills information is not available in this opportunity record.
            </p>
          </div>

          <div className="details-actions">
            <button
              className="apply-button"
              onClick={() => applyToOpportunity(item)}
              disabled={applyingIds.includes(item.id)}
            >
              {applyingIds.includes(item.id)
                ? "Processing..."
                : "Apply Now →"}
            </button>

            <button
              className={isSaved(item.id) ? "save-button saved" : "save-button"}
              onClick={() => toggleSave(item)}
              disabled={savingIds.includes(item.id)}
            >
              {savingIds.includes(item.id)
                ? "Saving..."
                : isSaved(item.id)
                  ? "♥ Saved"
                  : "♡ Save Opportunity"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-heading">
        <div>
          <p className="explore-label">FIND YOUR NEXT STEP</p>
          <h1>Explore Opportunities</h1>
          <p>Discover opportunities that match your ambitions.</p>
        </div>

        <div className="explore-count">
          <strong>{filteredOpportunities.length}</strong>
          <span>Opportunities found</span>
        </div>
      </div>

      <div className="explore-search">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search by title, organization or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="category-filters">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "filter active-filter" : "filter"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          margin: "18px 0 24px",
        }}
      >
        <select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          style={{
            padding: "11px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "var(--input-bg, #ffffff)",
            color: "var(--text-color, #222)",
          }}
        >
          {locations.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Locations" : item}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          style={{
            padding: "11px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "var(--input-bg, #ffffff)",
            color: "var(--text-color, #222)",
          }}
        >
          <option value="deadline">Sort: Upcoming deadline</option>
          <option value="title">Sort: Opportunity title</option>
          <option value="organization">Sort: Organization</option>
        </select>

        <button
          onClick={clearFilters}
          style={{
            padding: "11px 16px",
            borderRadius: "8px",
            border: "1px solid #2e7d32",
            background: "transparent",
            color: "var(--text-color, #222)",
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      </div>

      {loading && <p>Loading opportunities from the database...</p>}

      {!loading && error && (
        <div className="empty-results">
          <h2>Unable to load opportunities</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="opportunity-list">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((item) => (
              <article className="opportunity-card" key={item.id}>
                <div className="opportunity-top">
                  <span className="opportunity-category">
                    {item.category}
                  </span>

                  <button
                    className={
                      isSaved(item.id) ? "save-button saved" : "save-button"
                    }
                    onClick={() => toggleSave(item)}
                    disabled={savingIds.includes(item.id)}
                  >
                    {savingIds.includes(item.id)
                      ? "Saving..."
                      : isSaved(item.id)
                        ? "♥ Saved"
                        : "♡ Save"}
                  </button>
                </div>

                <h2>{item.title}</h2>
                <p className="organization">{item.organization}</p>
                <p className="description">{item.description}</p>

                <div className="opportunity-details">
                  <span>📍 {item.location}</span>
                  <span>📅 Deadline: {item.deadline}</span>
                </div>

                <div className="eligibility">
                  <strong>Eligibility:</strong> {item.eligibility}
                </div>

                <button
                  className="details-button"
                  onClick={() => setSelectedOpportunity(item)}
                >
                  View Details →
                </button>
              </article>
            ))
          ) : (
            <div className="empty-results">
              <h2>No opportunities found</h2>
              <p>Try another search term or change your filters.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Explore;
