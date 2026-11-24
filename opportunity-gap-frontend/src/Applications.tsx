
import { useEffect, useState, type FormEvent } from "react";
import "./Applications.css";

type Application = {
  applicationId: number;
  userId: number;
  title: string;
  organization: string;
  applicationDate: string;
  status: string;
};

const statuses = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

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

function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const userId = getUserId();

  const loadApplications = async () => {
    if (!userId) {
      setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/user/${userId}`
      );

      if (!response.ok) {
        throw new Error("Could not load applications.");
      }

      const data = await response.json();
      setApplications(data);
      setError("");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const addApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !organization.trim() || !userId) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/applications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: title.trim(),
            organization: organization.trim(),
            applicationDate: new Date().toISOString().split("T")[0],
            status: "Applied",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not save application.");
      }

      setTitle("");
      setOrganization("");
      setShowForm(false);
      await loadApplications();
    } catch {
      setError("Could not save your application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/applications/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update status.");
      }

      await loadApplications();
    } catch {
      setError("Could not update the application status.");
    }
  };

  const deleteApplication = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/applications/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Could not delete application.");
      }

      await loadApplications();
    } catch {
      setError("Could not delete the application. Please try again.");
    }
  };

  const countStatus = (status: string) =>
    applications.filter((item) => item.status === status).length;

  const getStatusClass = (status: string) =>
    status.toLowerCase().replace(/\s+/g, "-");

  const selectionRate =
    applications.length > 0
      ? Math.round(
          (countStatus("Selected") / applications.length) * 100
        )
      : 0;

  return (
    <div className="applications-page">
      <header className="applications-header">
        <div>
          <p className="eyebrow">YOUR CAREER JOURNEY</p>
          <h1>My Applications</h1>
          <p>Keep every opportunity and application organized.</p>
        </div>

        <button
          className="add-application-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Application
        </button>
      </header>

      {error && (
        <p className="application-error" role="alert">
          {error}
        </p>
      )}

      <section className="application-stats">
        <div className="application-stat">
          <span>Total Applications</span>
          <h2>{applications.length}</h2>
        </div>

        <div className="application-stat">
          <span>Under Review</span>
          <h2>{countStatus("Under Review")}</h2>
        </div>

        <div className="application-stat">
          <span>Shortlisted</span>
          <h2>{countStatus("Shortlisted")}</h2>
        </div>

        <div className="application-stat">
          <span>Selected</span>
          <h2>{countStatus("Selected")}</h2>
        </div>
      </section>

      <section className="application-progress-panel">
        <h2>Application Progress</h2>

        <p className="progress-description">
          See how your applications are moving through the hiring process.
        </p>

        <div className="progress-status-grid">
          {statuses.map((status) => (
            <div
              key={status}
              className={`progress-status-card ${getStatusClass(status)}`}
            >
              <p>{status}</p>
              <h2>{countStatus(status)}</h2>
            </div>
          ))}
        </div>

        <div className="selection-rate-section">
          <div className="selection-rate-heading">
            <strong>Selection rate</strong>
            <strong>{selectionRate}%</strong>
          </div>

          <div className="selection-progress-track">
            <div
              className="selection-progress-fill"
              style={{ width: `${selectionRate}%` }}
            />
          </div>

          <p className="selection-rate-description">
            {countStatus("Selected")} selected out of {applications.length}{" "}
            applications.
          </p>
        </div>
      </section>

      {showForm && (
        <form className="application-form" onSubmit={addApplication}>
          <h2>Add a new application</h2>

          <label>Job or opportunity title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Java Developer"
            required
          />

          <label>Company or organization</label>
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            placeholder="e.g. ABC Technologies"
            required
          />

          <div className="application-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Application"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="application-list-section">
        <h2>Application History</h2>

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="applications-empty">
            <div>📋</div>
            <h3>No applications yet</h3>
            <p>
              Add your first application and start tracking your progress.
            </p>
            <button onClick={() => setShowForm(true)}>
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="application-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.applicationId}
              >
                <div className="application-card-main">
                  <div className="application-icon">💼</div>

                  <div>
                    <h3>{application.title}</h3>
                    <p>{application.organization}</p>
                    <span>
                      Applied on{" "}
                      {application.applicationDate || "Date unavailable"}
                    </span>
                  </div>
                </div>

                <div className="application-card-actions">
                  <label htmlFor={`status-${application.applicationId}`}>
                    Application status
                  </label>

                  <select
                    id={`status-${application.applicationId}`}
                    value={application.status}
                    onChange={(event) =>
                      updateStatus(
                        application.applicationId,
                        event.target.value
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <span
                    className={`application-status ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>

                  <button
                    className="delete-application"
                    onClick={() =>
                      deleteApplication(application.applicationId)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Applications;
