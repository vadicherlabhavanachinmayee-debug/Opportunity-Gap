
import { useEffect, useState } from "react";
import "./SavedOpportunities.css";

const API_URL = "http://localhost:8080/api";
const OPPORTUNITIES_URL = `${API_URL}/opportunities`;
const SAVED_URL = `${API_URL}/saved-opportunities`;

type Opportunity = {
  id: number;
  title: string;
  organization: string;
  category: string;
  description: string;
  location: string;
  deadline: string;
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
  description: string;
  location: string;
  eligibilityCriteria: string;
  requiredDocuments: string;
  deadline: string;
  applicationUrl: string;
};

type SavedOpportunityResponse = {
  opportunityId: number;
};

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
    organization: item.organization,
    category: item.opportunityType,
    description: item.description,
    location: item.location,
    deadline: item.deadline,
    eligibility: item.eligibilityCriteria,
    documents: splitItems(item.requiredDocuments),
    skills: [],
    applicationUrl: item.applicationUrl,
  };
}

function SavedOpportunities() {
  const [saved, setSaved] = useState<Opportunity[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const userId = getUserId();

  const loadSavedOpportunities = async () => {
    if (!userId) {
      setError("Please log in to view your saved opportunities.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [opportunitiesResponse, savedResponse] = await Promise.all([
        fetch(OPPORTUNITIES_URL),
        fetch(`${SAVED_URL}/user/${userId}`),
      ]);

      if (!opportunitiesResponse.ok || !savedResponse.ok) {
        throw new Error("Unable to load saved opportunities.");
      }

      const opportunities: ApiOpportunity[] =
        await opportunitiesResponse.json();

      const savedRecords: SavedOpportunityResponse[] =
        await savedResponse.json();

      const savedIds = new Set(
        savedRecords.map((item) => Number(item.opportunityId))
      );

      const savedOpportunities = opportunities
        .filter((item) => savedIds.has(Number(item.opportunityId)))
        .map(mapOpportunity);

      setSaved(savedOpportunities);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading saved opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedOpportunities();
  }, []);

  const removeSaved = async (id: number) => {
    if (!userId) return;

    try {
      setRemovingId(id);
      setError("");

      const response = await fetch(
        `${SAVED_URL}?userId=${userId}&opportunityId=${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Could not remove this saved opportunity.");
      }

      setSaved((previous) => previous.filter((item) => item.id !== id));

      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove this opportunity."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="saved-page">
        <h1>Saved Opportunities</h1>
        <p>Loading your saved opportunities...</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="saved-page">
        <button
          className="saved-back-button"
          onClick={() => setSelected(null)}
        >
          ← Back to Saved Opportunities
        </button>

        <article className="saved-detail-card">
          <span className="saved-category">{selected.category}</span>
          <h1>{selected.title}</h1>
          <h3>{selected.organization}</h3>
          <p>{selected.description}</p>

          <div className="saved-detail-grid">
            <div>
              <span>LOCATION</span>
              <strong>{selected.location || "Not specified"}</strong>
            </div>
            <div>
              <span>DEADLINE</span>
              <strong>{selected.deadline || "Not specified"}</strong>
            </div>
          </div>

          <h3>Eligibility Requirements</h3>
          <p>{selected.eligibility || "Not specified"}</p>

          <h3>Required Documents</h3>
          {selected.documents.length > 0 ? (
            <ul>
              {selected.documents.map((document) => (
                <li key={document}>{document}</li>
              ))}
            </ul>
          ) : (
            <p>No documents listed.</p>
          )}

          <h3>Required Skills</h3>
          <p>
            Specific skills have not been provided in this opportunity record.
          </p>

          {selected.applicationUrl && (
            <a
              href={selected.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="saved-view-button"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              View Application Link →
            </a>
          )}

          <button
            className="remove-saved-button"
            onClick={() => removeSaved(selected.id)}
            disabled={removingId === selected.id}
          >
            {removingId === selected.id ? "Removing..." : "Remove from Saved"}
          </button>
        </article>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <header className="saved-header">
        <div>
          <p className="eyebrow">YOUR SHORTLIST</p>
          <h1>Saved Opportunities</h1>
          <p>Keep track of opportunities you want to explore later.</p>
        </div>

        <div className="saved-count">
          <strong>{saved.length}</strong>
          <span>Saved</span>
        </div>
      </header>

      {error && (
        <p role="alert" style={{ color: "#dc2626", marginBottom: "16px" }}>
          {error}
        </p>
      )}

      {saved.length === 0 ? (
        <div className="saved-empty">
          <div className="saved-empty-icon">♡</div>
          <h2>No saved opportunities yet</h2>
          <p>
            Visit Explore Opportunities and click Save on opportunities you
            are interested in.
          </p>
        </div>
      ) : (
        <div className="saved-list">
          {saved.map((item) => (
            <article className="saved-card" key={item.id}>
              <div className="saved-card-top">
                <span className="saved-category">{item.category}</span>
                <span className="saved-deadline">
                  Deadline: {item.deadline || "Not specified"}
                </span>
              </div>

              <h2>{item.title}</h2>
              <p className="saved-organization">{item.organization}</p>
              <p className="saved-description">{item.description}</p>

              <div className="saved-meta">
                <span>📍 {item.location || "Location not specified"}</span>
                <span>📄 {item.documents.length} listed documents</span>
              </div>

              <div className="saved-actions">
                <button
                  className="saved-view-button"
                  onClick={() => setSelected(item)}
                >
                  View Details →
                </button>

                <button
                  className="remove-saved-button"
                  onClick={() => removeSaved(item.id)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedOpportunities;
