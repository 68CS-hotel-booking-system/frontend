import { useNavigate } from 'react-router'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div
      className="atelier-card"
      style={{
        padding: '48px 32px',
        textAlign: 'center',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <span className="atelier-season-pill">HTTP 404 • Route Not Found</span>
      <h1 className="atelier-headline-xl">Sanctuary Wing Not Found</h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--atelier-on-surface-variant)',
          maxWidth: 520,
          margin: 0,
        }}
      >
        The page or folio path you requested does not exist in Grand Heritage
        Hotel &amp; Residences or Atelier OS.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          marginTop: 8,
        }}
      >
        <button
          type="button"
          className="gh-btn-primary"
          onClick={() => void navigate('/')}
        >
          Return to Grand Heritage Landing
        </button>
        <button
          type="button"
          className="gh-btn-secondary"
          onClick={() => void navigate('/admin')}
        >
          Open Atelier OS Admin
        </button>
      </div>
    </div>
  )
}
