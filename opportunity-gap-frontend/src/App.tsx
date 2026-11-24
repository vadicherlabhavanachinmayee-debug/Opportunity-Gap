
import { useEffect, useState } from 'react'
import Auth from './Auth'
import Explore from './Explore'
import Profile from './Profile'
import EligibilityAnalyzer from './EligibilityAnalyzer'
import Applications from './Applications'
import SavedOpportunities from './SavedOpportunities'
import Notifications from './Notifications'
import AIAssistant from './AIAssistant'
import './App.css'

type AuthUser = {
  userId: number
  name: string
  email: string
}

type Opportunity = {
  opportunityId: number
  title: string
  organization: string
  opportunityType: string
  eligibilityCriteria: string
  requiredDocuments: string
}

type UserProfile = {
  highestQualification: string
  degree: string
  fieldOfStudy: string
  skills: string
}

type NotificationData = {
  isRead: boolean
}

const API_URL = 'http://localhost:8080/api'

const menuItems = [
  { name: 'Dashboard', icon: '⌂' },
  { name: 'Explore Opportunities', icon: '⌕' },
  { name: 'My Applications', icon: '▤' },
  { name: 'Saved Opportunities', icon: '☆' },
  { name: 'Eligibility Analyzer', icon: '◎' },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [assistantOpen, setAssistantOpen] = useState(false)

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = sessionStorage.getItem('opportunityGapUser')
      return savedUser ? JSON.parse(savedUser) as AuthUser : null
    } catch {
      return null
    }
  })

  const [opportunityCount, setOpportunityCount] = useState(0)
  const [applicationCount, setApplicationCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [matchedCount, setMatchedCount] = useState<number | null>(null)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    let cancelled = false

    const loadDashboard = async () => {
      setDashboardLoading(true)

      try {
        const [
          opportunitiesResponse,
          applicationsResponse,
          savedResponse,
          profileResponse,
          notificationsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/opportunities`),
          fetch(`${API_URL}/applications/user/${currentUser.userId}`),
          fetch(`${API_URL}/saved-opportunities/user/${currentUser.userId}`),
          fetch(`${API_URL}/profiles/${currentUser.userId}`),
          fetch(`${API_URL}/notifications/user/${currentUser.userId}`),
        ])

        if (!opportunitiesResponse.ok) {
          throw new Error('Could not load opportunities.')
        }

        if (!applicationsResponse.ok) {
          throw new Error('Could not load applications.')
        }

        if (!savedResponse.ok) {
          throw new Error('Could not load saved opportunities.')
        }

        const opportunities: Opportunity[] =
          await opportunitiesResponse.json()

        const applications = await applicationsResponse.json()
        const savedOpportunities = await savedResponse.json()

        const notifications: NotificationData[] =
          notificationsResponse.ok
            ? await notificationsResponse.json()
            : []

        let profile: UserProfile | null = null

        if (profileResponse.ok && profileResponse.status !== 204) {
          profile = await profileResponse.json()
        }

        if (cancelled) return

        setOpportunityCount(opportunities.length)
        setApplicationCount(applications.length)
        setSavedCount(savedOpportunities.length)

        setUnreadNotificationCount(
          notifications.filter((notification) => !notification.isRead).length
        )

        if (!profile) {
          setMatchedCount(null)
        } else {
          const profileTerms = [
            profile.highestQualification,
            profile.degree,
            profile.fieldOfStudy,
            ...(profile.skills || '').split(','),
          ]
            .filter(Boolean)
            .map((item) => item.trim().toLowerCase())

          const matched = opportunities.filter((opportunity) => {
            const requirements =
              (opportunity.eligibilityCriteria || '').toLowerCase()

            if (!requirements.trim()) return false

            return profileTerms.some(
              (term) => term.length > 2 && requirements.includes(term)
            )
          }).length

          setMatchedCount(matched)
        }
      } catch (error) {
        console.error('Dashboard loading error:', error)
      } finally {
        if (!cancelled) {
          setDashboardLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [currentUser, activePage])

  const handleLogout = () => {
    sessionStorage.removeItem('opportunityGapUser')
    setCurrentUser(null)
    setActivePage('Dashboard')
    setAssistantOpen(false)
  }

  const openPage = (page: string) => {
    setActivePage(page)
  }

  if (!currentUser) {
    return (
      <Auth
        onAuthSuccess={(user) => {
          sessionStorage.setItem(
            'opportunityGapUser',
            JSON.stringify(user)
          )
          setCurrentUser(user)
          setActivePage('Dashboard')
        }}
      />
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Explore Opportunities':
        return <Explore />

      case 'My Profile':
        return <Profile />

      case 'Eligibility Analyzer':
        return <EligibilityAnalyzer />

      case 'My Applications':
        return <Applications />

      case 'Saved Opportunities':
        return <SavedOpportunities />

      case 'Notifications':
        return <Notifications />

      default:
        return (
          <>
            <header className="topbar">
              <div>
                <p className="topbar-label">YOUR PERSONAL OPPORTUNITY HUB</p>
                <h2>Dashboard</h2>
                <p>
                  Welcome back, {currentUser.name}! Your next opportunity
                  starts here.
                </p>
              </div>
            </header>

            <section className="welcome">
              <div>
                <p className="eyebrow">
                  YOUR FUTURE, YOUR OPPORTUNITY
                </p>

                <h1>
                  Don't let opportunities
                  <br />
                  pass you by.
                </h1>

                <p>
                  Discover opportunities that match your skills,
                  qualifications and goals.
                </p>

                <button
                  onClick={() => openPage('Explore Opportunities')}
                >
                  Explore Opportunities →
                </button>
              </div>

              <div className="welcome-icon">✦</div>
            </section>

            <section className="stats">
              <div
                className="stat-card clickable-card"
                role="button"
                tabIndex={0}
                onClick={() => openPage('Explore Opportunities')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPage('Explore Opportunities')
                  }
                }}
                title="Explore all opportunities"
              >
                <span>Available Opportunities</span>
                <h2>{dashboardLoading ? '...' : opportunityCount}</h2>
                <p>Across different categories</p>
                <small>Explore now →</small>
              </div>

              <div
                className="stat-card clickable-card"
                role="button"
                tabIndex={0}
                onClick={() => openPage('Eligibility Analyzer')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPage('Eligibility Analyzer')
                  }
                }}
                title="Check your eligibility"
              >
                <span>Matched For You</span>
                <h2>
                  {dashboardLoading
                    ? '...'
                    : matchedCount === null
                      ? '--'
                      : matchedCount}
                </h2>
                <p>
                  {matchedCount === null
                    ? 'Complete your profile to match'
                    : 'Based on basic profile matching'}
                </p>
                <small>Check eligibility →</small>
              </div>

              <div
                className="stat-card clickable-card"
                role="button"
                tabIndex={0}
                onClick={() => openPage('My Applications')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPage('My Applications')
                  }
                }}
                title="Track your applications"
              >
                <span>Applications</span>
                <h2>{dashboardLoading ? '...' : applicationCount}</h2>
                <p>Track your progress here</p>
                <small>View applications →</small>
              </div>

              <div
                className="stat-card clickable-card"
                role="button"
                tabIndex={0}
                onClick={() => openPage('Saved Opportunities')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPage('Saved Opportunities')
                  }
                }}
                title="View saved opportunities"
              >
                <span>Saved Opportunities</span>
                <h2>{dashboardLoading ? '...' : savedCount}</h2>
                <p>Your shortlisted opportunities</p>
                <small>View saved →</small>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Explore by Category</h2>
                  <p>Find opportunities that move you forward.</p>
                </div>
              </div>

              <div className="categories">
                <div
                  className="category-card clickable-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPage('Explore Opportunities')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPage('Explore Opportunities')
                    }
                  }}
                >
                  <span>💼</span>
                  <h3>Jobs</h3>
                  <p>Full-time career opportunities</p>
                  <small>Explore jobs →</small>
                </div>

                <div
                  className="category-card clickable-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPage('Explore Opportunities')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPage('Explore Opportunities')
                    }
                  }}
                >
                  <span>🎓</span>
                  <h3>Scholarships</h3>
                  <p>Financial support for education</p>
                  <small>Explore scholarships →</small>
                </div>

                <div
                  className="category-card clickable-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPage('Explore Opportunities')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPage('Explore Opportunities')
                    }
                  }}
                >
                  <span>🏛️</span>
                  <h3>Government Schemes</h3>
                  <p>Explore government benefits</p>
                  <small>Explore schemes →</small>
                </div>

                <div
                  className="category-card clickable-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPage('Explore Opportunities')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPage('Explore Opportunities')
                    }
                  }}
                >
                  <span>🚀</span>
                  <h3>Internships</h3>
                  <p>Build practical experience</p>
                  <small>Explore internships →</small>
                </div>
              </div>
            </section>

            <section className="section quick-actions-section">
              <div className="section-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Get straight to what you need.</p>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  className="quick-action-card"
                  onClick={() => openPage('Explore Opportunities')}
                >
                  <span className="quick-action-icon">⌕</span>
                  <span>
                    <strong>Find Opportunities</strong>
                    <small>Discover jobs, scholarships and more</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() => openPage('My Applications')}
                >
                  <span className="quick-action-icon">▤</span>
                  <span>
                    <strong>Track Applications</strong>
                    <small>Check the progress of your applications</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>

                <button
                  className="quick-action-card"
                  onClick={() => openPage('Eligibility Analyzer')}
                >
                  <span className="quick-action-icon">◎</span>
                  <span>
                    <strong>Check Eligibility</strong>
                    <small>Find your gaps and next steps</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>
              </div>
            </section>

            <section className="section analyzer">
              <div>
                <p className="eyebrow">OUR SPECIAL FEATURE</p>
                <h2>Discover your Opportunity Gap</h2>

                <p>
                  Find out what stands between you and your next
                  opportunity. Identify missing skills, qualifications
                  and documents, and get actionable steps to improve
                  your chances.
                </p>

                <button
                  onClick={() => openPage('Eligibility Analyzer')}
                >
                  Analyze My Eligibility →
                </button>
              </div>

              <div className="analyzer-icon">◎</div>
            </section>

            <footer>
              Opportunity Gap © 2026 · Every opportunity deserves a chance.
            </footer>
          </>
        )
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <nav className="sidebar-nav" aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              onClick={() => setActivePage(item.name)}
              aria-label={item.name}
              title={item.name}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-tooltip">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <span className="nav-icon">↪</span>
            <span className="logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-brand-bar">
          <div className="main-brand">
            <h1>OPPORTUNITY GAP</h1>
            <p>DISCOVER · PREPARE · ACHIEVE</p>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-notification"
              onClick={() => setActivePage('Notifications')}
              title="Notifications"
              aria-label="Open notifications"
            >
              ♧
              {unreadNotificationCount > 0 && (
                <span className="topbar-notification-count">
                  {unreadNotificationCount > 9
                    ? '9+'
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              className="profile"
              onClick={() => setActivePage('My Profile')}
              title="My Profile"
              aria-label="Open my profile"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {renderPage()}
      </main>

      <button
        className="assistant-toggle"
        onClick={() => setAssistantOpen((previous) => !previous)}
        aria-label={assistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
        title="AI Career Assistant"
      >
        {assistantOpen ? '✕' : '🤖'}
      </button>

      {assistantOpen && (
        <div className="assistant-panel">
          <AIAssistant />
        </div>
      )}
    </div>
  )
}

export default App
