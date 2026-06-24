import { useState } from 'react'

export default function LoginModal({ onLogin }) {
  const [name, setName] = useState('')
  const [reg, setReg] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  // Simple PIN: last 4 of reg plate + shared company PIN
  // In production you'd store hashed PINs in Firestore
  const COMPANY_PIN = '1234' // Change this to your company PIN

  const handleSubmit = () => {
    if (!name.trim()) { setError('Enter your name'); return }
    if (!reg.trim()) { setError('Enter your vehicle registration'); return }
    if (pin !== COMPANY_PIN) { setError('Incorrect PIN'); return }
    onLogin({ name: name.trim(), reg: reg.trim().toUpperCase() })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>EV Charger Hub</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 36, textAlign: 'center' }}>
        Real-time charger availability for Elekta EV drivers
      </p>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 28,
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>YOUR NAME</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Imdad KP"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>VEHICLE REG</label>
          <input
            value={reg}
            onChange={e => setReg(e.target.value.toUpperCase())}
            placeholder="e.g. BK25EYV"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>COMPANY PIN</label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          style={{
            background: 'var(--green)', color: '#0a1a0a',
            padding: '12px', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, fontSize: 15, marginTop: 4
          }}
        >
          Sign in
        </button>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 20, textAlign: 'center' }}>
        Sessions are saved locally. Your name & reg are visible to all EV users.
      </p>
    </div>
  )
}
