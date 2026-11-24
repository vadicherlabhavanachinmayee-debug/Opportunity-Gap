
import { useEffect, useMemo, useState } from "react";
import "./EligibilityAnalyzer.css";

const API_URL = "http://localhost:8080/api/opportunities";
const PROFILE_KEY = "opportunityGapProfileDraft";

type Opportunity = {
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

type UserProfile = {
  name?: string;
  qualification?: string;
  degree?: string;
  field?: string;
  graduationYear?: string | number;
  location?: string;
  workMode?: string;
  skills?: string;
  interests?: string;
};

const emptyProfile: UserProfile = {};

function readProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : emptyProfile;
  } catch {
    return emptyProfile;
  }
}

function splitDocuments(value: string): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProfileText(profile: UserProfile): string {
  return [
    profile.qualification,
    profile.degree,
    profile.field,
    profile.skills,
    profile.interests,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getRequirementMatch(
  criteria: string,
  profile: UserProfile
): { matched: boolean; explanation: string } {
  const text = criteria.toLowerCase().trim();

  if (!text) {
    return {
      matched: false,
      explanation:
        "The opportunity does not provide detailed eligibility criteria.",
    };
  }

  const profileText = getProfileText(profile);
  const field = profile.field?.toLowerCase().trim() || "";
  const qualification = profile.qualification?.toLowerCase().trim() || "";
  const degree = profile.degree?.toLowerCase().trim() || "";

  if (
    text.includes("computer science") &&
    (field.includes("computer science") ||
      degree.includes("computer science"))
  ) {
    return {
      matched: true,
      explanation:
        "Your Computer Science education appears relevant to this requirement.",
    };
  }

  if (
    (text.includes("graduate") || text.includes("graduation")) &&
    (qualification.includes("graduate") ||
      qualification.includes("bachelor") ||
      qualification.includes("master") ||
      degree.includes("bs-ms") ||
      degree.includes("bachelor") ||
      degree.includes("master"))
  ) {
    return {
      matched: true,
      explanation:
        "Your education details appear relevant to the graduate requirement.",
    };
  }

  if (
    text.includes("programming fundamentals") &&
    profile.skills?.trim()
  ) {
    return {
      matched: true,
      explanation:
        "You have listed skills in your profile. Review the employer's exact programming requirements.",
    };
  }

  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        ![
          "with",
          "from",
          "that",
          "this",
          "students",
          "graduates",
          "graduate",
          "recent",
          "meeting",
          "criteria",
          "academic",
          "eligibility",
          "fundamentals",
          "degree",
          "required",
        ].includes(word)
    );

  const matchingWords = words.filter((word) =>
    profileText.includes(word)
  );

  if (matchingWords.length > 0) {
    return {
      matched: true,
      explanation: `Your profile matches some listed terms: ${matchingWords.join(
        ", "
      )}.`,
    };
  }

  return {
    matched: false,
    explanation:
      "Your profile does not currently show a clear match for this requirement.",
  };
}

function getSuggestedSkills(
  opportunity: Opportunity,
  profile: UserProfile
): string[] {
  const text =
    `${opportunity.eligibilityCriteria} ${opportunity.description}`.toLowerCase();

  const knownSkills = [
    "java",
    "python",
    "javascript",
    "typescript",
    "react",
    "spring boot",
    "sql",
    "mysql",
    "html",
    "css",
    "c++",
    "c",
    "node.js",
    "git",
    "data structures",
  ];

  const requiredSkills = knownSkills.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(
      text
    );
  });

  const userSkills = (profile.skills || "")
    .toLowerCase()
    .split(/[,;\n]/)
    .map((skill) => skill.trim());

  return requiredSkills.filter((skill) => !userSkills.includes(skill));
}

export default function EligibilityAnalyzer() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<UserProfile>(readProfile);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [checkedDocuments, setCheckedDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load opportunities from the backend.");
        }

        const data: Opportunity[] = await response.json();
        setOpportunities(data);

        if (data.length > 0) {
          setSelectedId(data[0].opportunityId);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading opportunities."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  useEffect(() => {
    const updateProfile = () => setProfile(readProfile());

    window.addEventListener("storage", updateProfile);
    window.addEventListener("focus", updateProfile);

    return () => {
      window.removeEventListener("storage", updateProfile);
      window.removeEventListener("focus", updateProfile);
    };
  }, []);

  const selectedOpportunity = useMemo(
    () =>
      opportunities.find(
        (opportunity) => opportunity.opportunityId === selectedId
      ),
    [opportunities, selectedId]
  );

  const requiredDocuments = useMemo(
    () =>
      selectedOpportunity
        ? splitDocuments(selectedOpportunity.requiredDocuments)
        : [],
    [selectedOpportunity]
  );

  const requirementResult = selectedOpportunity
    ? getRequirementMatch(selectedOpportunity.eligibilityCriteria, profile)
    : null;

  const missingDocuments = requiredDocuments.filter(
    (document) => !checkedDocuments.includes(document)
  );

  const missingSkills = selectedOpportunity
    ? getSuggestedSkills(selectedOpportunity, profile)
    : [];

  const profileComplete = Boolean(
    profile.qualification &&
      profile.degree &&
      profile.field &&
      profile.skills
  );

  const matchScore = selectedOpportunity
    ? Math.round(
        (requirementResult?.matched ? 60 : 20) +
          (requiredDocuments.length === 0
            ? 20
            : (checkedDocuments.length / requiredDocuments.length) * 20) +
          (profileComplete ? 20 : 0)
      )
    : 0;

  const handleOpportunityChange = (value: string) => {
    setSelectedId(value ? Number(value) : "");
    setCheckedDocuments([]);
    setAnalyzed(false);
  };

  const toggleDocument = (document: string) => {
    setCheckedDocuments((previous) =>
      previous.includes(document)
        ? previous.filter((item) => item !== document)
        : [...previous, document]
    );

    setAnalyzed(false);
  };

  const analyzeOpportunity = () => {
    setAnalyzed(true);
  };

  if (loading) {
    return (
      <div className="analyzer-page">
        <div className="analyzer-check-card">
          <h2>Opportunity Gap Analyzer</h2>
          <p className="analyzer-muted">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analyzer-page">
      <header className="analyzer-header">
        <p className="analyzer-tag">CAREER MATCHING TOOL</p>
        <h1>Opportunity Gap Analyzer</h1>
        <p>
          Compare your profile with opportunities and discover what you may
          still need to improve before applying.
        </p>
      </header>

      {error && <div className="analyzer-notice">{error}</div>}

      <section className="analyzer-check-card">
        <h2>1. Your Profile</h2>

        {profileComplete ? (
          <>
            <p className="profile-status">
              <span>✓</span> Your profile information is available.
            </p>

            <div className="analyzer-profile">
              <div>
                <span>EDUCATION</span>
                <strong>
                  {profile.qualification} — {profile.degree}
                </strong>
              </div>

              <div>
                <span>FIELD OF STUDY</span>
                <strong>{profile.field}</strong>
              </div>

              <div>
                <span>GRADUATION YEAR</span>
                <strong>{profile.graduationYear || "Not provided"}</strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{profile.location || "Not provided"}</strong>
              </div>

              <div className="profile-skills">
                <span>SKILLS</span>
                <strong>{profile.skills}</strong>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="profile-incomplete">
              Your profile is incomplete.
            </p>
            <p className="analyzer-muted">
              Add your qualification, degree, field of study and skills in
              My Profile to get a more useful comparison.
            </p>
          </>
        )}
      </section>

      <section className="analyzer-check-card">
        <h2>2. Select an Opportunity</h2>

        {opportunities.length === 0 ? (
          <p className="analyzer-muted">
            No opportunities are available yet. Add opportunities to your
            database first.
          </p>
        ) : (
          <>
            <select
              className="analyzer-select"
              value={selectedId}
              onChange={(event) =>
                handleOpportunityChange(event.target.value)
              }
            >
              {opportunities.map((opportunity) => (
                <option
                  key={opportunity.opportunityId}
                  value={opportunity.opportunityId}
                >
                  {opportunity.title} — {opportunity.organization}
                </option>
              ))}
            </select>

            {selectedOpportunity && (
              <div className="selected-opportunity">
                <div className="selected-opportunity-top">
                  <div>
                    <span className="analyzer-tag">
                      {selectedOpportunity.opportunityType}
                    </span>
                    <h3>{selectedOpportunity.title}</h3>
                    <p>{selectedOpportunity.organization}</p>
                  </div>
                  <div className="job-symbol">✦</div>
                </div>

                <div className="opportunity-info">
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedOpportunity.location || "Not specified"}
                  </p>
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {selectedOpportunity.deadline || "Not specified"}
                  </p>
                </div>

                <p className="analyzer-muted">
                  {selectedOpportunity.description}
                </p>

                <div className="eligibility-criteria">
                  <strong>Eligibility Criteria</strong>
                  <p className="analyzer-muted">
                    {selectedOpportunity.eligibilityCriteria ||
                      "No eligibility criteria provided."}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedOpportunity && (
        <>
          <section className="analyzer-check-card">
            <h2>3. Check Your Documents</h2>
            <p className="analyzer-muted">
              Tick the documents you already have ready.
            </p>

            {requiredDocuments.length === 0 ? (
              <p className="analyzer-muted">
                No document requirements were provided for this opportunity.
              </p>
            ) : (
              <div className="document-options">
                {requiredDocuments.map((document) => (
                  <label className="document-option" key={document}>
                    <input
                      type="checkbox"
                      checked={checkedDocuments.includes(document)}
                      onChange={() => toggleDocument(document)}
                    />
                    {document}
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="analyzer-check-card">
            <h2>4. Analyze Your Opportunity Gap</h2>
            <p className="analyzer-muted">
              Run a profile comparison to see possible matches and missing
              requirements.
            </p>

            <button
              className="analyze-button"
              onClick={analyzeOpportunity}
            >
              ✦ Analyze Opportunity
            </button>

            {analyzed && (
              <div className="analysis-results">
                <div className="result-heading">
                  <div>
                    <span className="analyzer-tag">YOUR RESULTS</span>
                    <h2>Analysis Results</h2>
                    <p className="analyzer-muted">
                      Estimated profile compatibility
                    </p>
                  </div>

                  <div className="score-circle">
                    <strong>{matchScore}%</strong>
                    <span>MATCH</span>
                  </div>
                </div>

                <div className="score-track">
                  <div
                    className="score-fill"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>

                <p className="demo-disclaimer">
                  This is a prototype comparison, not an official eligibility
                  decision.
                </p>

                <div className="result-columns">
                  <div className="result-box">
                    <h3>Education and Eligibility</h3>
                    <p
                      className={
                        requirementResult?.matched
                          ? "success-item"
                          : "missing-item"
                      }
                    >
                      {requirementResult?.explanation}
                    </p>
                  </div>

                  <div className="result-box">
                    <h3>Missing Documents</h3>
                    {missingDocuments.length > 0 ? (
                      <ul className="missing-list">
                        {missingDocuments.map((document) => (
                          <li key={document}>{document}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="success-item">
                        ✓ All listed documents are marked as ready.
                      </p>
                    )}
                  </div>

                  <div className="result-box">
                    <h3>Possible Skill Gaps</h3>
                    {missingSkills.length > 0 ? (
                      <>
                        <p className="analyzer-muted">
                          These skills appear in the opportunity description
                          or eligibility text but are not listed in your
                          profile:
                        </p>
                        <ul className="missing-list">
                          {missingSkills.map((skill) => (
                            <li key={skill}>{skill}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="success-item">
                        No specific missing technical skills were identified
                        in the available opportunity information.
                      </p>
                    )}
                  </div>

                  <div className="result-box">
                    <h3>Recommended Next Steps</h3>
                    <ul className="recommendation-list">
                      {!profileComplete && (
                        <li>
                          Complete your education and skills in My Profile.
                        </li>
                      )}

                      {missingDocuments.map((document) => (
                        <li key={document}>
                          Prepare your {document}.
                        </li>
                      ))}

                      {missingSkills.map((skill) => (
                        <li key={skill}>
                          Review and practise {skill} if it is relevant to
                          your career goals.
                        </li>
                      ))}

                      <li>
                        Review the employer's official eligibility
                        conditions before applying.
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="demo-disclaimer">
                  This analyzer uses basic keyword and profile matching.
                  Opportunity records may not contain every eligibility
                  condition, so always verify the official listing.
                </p>

                {selectedOpportunity.applicationUrl && (
                  <a
                    className="analyze-button application-link"
                    href={selectedOpportunity.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Application Link →
                  </a>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
