
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './Profile.css'

const API_URL = 'http://localhost:8080/api/profiles'
const DRAFT_KEY = 'opportunityGapProfileDraft'

type ProfileData = {
  name: string
  email: string
  qualification: string
  degree: string
  field: string
  graduationYear: string
  location: string
  workMode: string
  skills: string
  interests: string
}

const emptyProfile: ProfileData = {
  name: '',
  email: '',
  qualification: '',
  degree: '',
  field: 'Computer Science',
  graduationYear: '2026',
  location: 'Hyderabad',
  workMode: 'Any',
  skills: '',
  interests: '',
}

function getSavedDraft(): ProfileData | null {
  try {
    const draft = localStorage.getItem(DRAFT_KEY)
    return draft ? { ...emptyProfile, ...JSON.parse(draft) } : null
  } catch {
    return null
  }
}

function Profile() {
  const [profile, setProfile] = useState<ProfileData>(
    () => getSavedDraft() || emptyProfile
  )

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [draftReady, setDraftReady] = useState(false)
  const [message, setMessage] = useState('')

  const userData = sessionStorage.getItem('opportunityGapUser')

  let user: { userId?: number; name?: string; email?: string } | null = null

  try {
    user = userData ? JSON.parse(userData) : null
  } catch {
    user = null
  }

  const userId = user?.userId

  // Load the saved profile or retain the browser draft.
  useEffect(() => {
    const existingDraft = getSavedDraft()

    if (existingDraft) {
      setProfile({
        ...existingDraft,
        name: existingDraft.name || user?.name || '',
        email: existingDraft.email || user?.email || '',
      })
      setLoading(false)
      setDraftReady(true)
      return
    }

    if (!userId) {
      setProfile({
        ...emptyProfile,
        name: user?.name || '',
        email: user?.email || '',
      })
      setMessage('Please log in to manage your profile.')
      setLoading(false)
      setDraftReady(true)
      return
    }

    fetch(`${API_URL}/${userId}`)
      .then(async (response) => {
        if (response.status === 204) return null
        if (!response.ok) throw new Error('Could not load profile.')
        return response.json()
      })
      .then((data) => {
        if (data) {
          setProfile({
            name: user?.name || '',
            email: user?.email || '',
            qualification: data.highestQualification || '',
            degree: data.degree || '',
            field: data.fieldOfStudy || 'Computer Science',
            graduationYear: data.graduationYear
              ? String(data.graduationYear)
              : '2026',
            location: data.location || 'Hyderabad',
            workMode: data.preferredWorkMode || 'Any',
            skills: data.skills || '',
            interests: data.interests || '',
          })
        } else {
          setProfile({
            ...emptyProfile,
            name: user?.name || '',
            email: user?.email || '',
          })
        }
      })
      .catch(() => {
        setMessage('Unable to load your saved profile. Your draft is still available.')
        setProfile({
          ...emptyProfile,
          name: user?.name || '',
          email: user?.email || '',
        })
      })
      .finally(() => {
        setLoading(false)
        setDraftReady(true)
      })
  }, [userId])

  // Automatically save every change as a browser draft.
  useEffect(() => {
    if (!draftReady) return

    localStorage.setItem(DRAFT_KEY, JSON.stringify(profile))
  }, [profile, draftReady])

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setProfile((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
    setSaved(false)
    setMessage('')
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userId) {
      setMessage('Please log in again to save your profile.')
      return
    }

    const profileToSave = {
      userId,
      highestQualification: profile.qualification,
      degree: profile.degree,
      fieldOfStudy: profile.field,
      graduationYear: Number(profile.graduationYear),
      location: profile.location,
      preferredWorkMode: profile.workMode,
      skills: profile.skills,
      interests: profile.interests,
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileToSave),
      })

      if (!response.ok) {
        throw new Error('Could not save profile.')
      }

      setSaved(true)
      setMessage('✓ Profile saved successfully!')
    } catch {
      setSaved(false)
      setMessage(
        'Your draft is saved in this browser, but the database save failed. We will fix the connection.'
      )
    }
  }

  if (loading) {
    return <div className="profile-page">Loading your profile...</div>
  }

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <p>PERSONALIZE YOUR EXPERIENCE</p>
        <h1>My Profile</h1>
        <span>
          Tell us about yourself so we can find opportunities that fit you.
        </span>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <section className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-grid">
            <label>
              Full Name
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h2>Education Details</h2>
          <div className="profile-grid">
            <label>
              Highest Qualification
              <select
                name="qualification"
                value={profile.qualification}
                onChange={handleChange}
                required
              >
                <option value="">Select qualification</option>
                <option>Undergraduate</option>
                <option>Postgraduate</option>
                <option>Integrated Degree</option>
                <option>Diploma</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Degree / Course
              <input
                name="degree"
                value={profile.degree}
                onChange={handleChange}
                placeholder="e.g. Integrated BS-MS Computer Science"
              />
            </label>

            <label>
              Field of Study
              <input
                name="field"
                value={profile.field}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </label>

            <label>
              Graduation Year
              <select
                name="graduationYear"
                value={profile.graduationYear}
                onChange={handleChange}
              >
                {Array.from({ length: 12 }, (_, index) => 2020 + index).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h2>Preferences</h2>
          <div className="profile-grid">
            <label>
              Preferred Location
              <input
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="e.g. Hyderabad"
              />
            </label>

            <label>
              Preferred Work Mode
              <select
                name="workMode"
                value={profile.workMode}
                onChange={handleChange}
              >
                <option>Any</option>
                <option>On-site</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h2>Skills and Interests</h2>
          <label>
            Your Skills
            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              placeholder="e.g. Java, SQL, React, Python"
              rows={3}
            />
          </label>

          <label>
            Areas of Interest
            <textarea
              name="interests"
              value={profile.interests}
              onChange={handleChange}
              placeholder="e.g. Software Development, Full Stack Development"
              rows={3}
            />
          </label>
        </section>

        <div className="profile-actions">
          <button type="submit">Save Profile →</button>
          {message && (
            <span className={saved ? 'profile-success' : ''}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

export default Profile
