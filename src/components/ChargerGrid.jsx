import { useState } from 'react'

function timeSince(ts) {
  if (!ts) return ''
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function StartModal({ chargerId, onConfirm, onClose }) {
  const [targetPercent, setTargetPercent] = useState('')
  const [note, setNote] = useState('')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 16
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24, width: '100%', maxWidth: 340
      }}>
        <h3 style={{ marginBottom: 18 }}>Start Charger {chargerId} ⚡</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>TARGET % (optional)</label>
            <input
              type="number" min="10" max="100"
              value={targetPercent}
              onChange={e => setTargetPercent(e.target.value)}
              placeholder="e.g. 80"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NOTE (optional)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Need 50% by 2pm"
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text-dim)', padding: 12 }}>Cancel</button>
            <button
              onClick={() => onConfirm(chargerId, targetPercent, note)}
              style={{ flex: 2, background: 'var(--green)', color: '#0a1a0a', padding: 12, fontWeight: 700 }}
            >
              Start charging
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChargerGrid({ chargers, user, myCharger, onStart, onStop, onJoinQueue }) {
  const [modalCharger, setModalCharger] = useState(null)

  const handleStartClick = (chargerId) => {
    setModalCharger(chargerId)
  }

  const handleConfirm = async (chargerId, targetPercent, note) => {
    await onStart(chargerId, targetPercent, note)
    setModalCharger(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18 }}>Chargers</h2>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {chargers.filter(c => c.status === 'free').length} of {chargers.length} available
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {chargers.map(charger => {
          const isFree = charger.status === 'free'
          const isMe = charger.occupant === user.name
          const isMine = myCharger?.id === charger.id

          return (
            <div key={charger.id} style={{
              background: 'var(--surface)',
              border: `1.5px solid ${isFree ? 'rgba(0,230,118,0.3)' : isMe ? 'rgba(68,138,255,0.5)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: 16,
              transition: 'border-color 0.2s'
            }}>
              {/* Charger number + status dot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16 }}>
                  Charger {charger.id}
                </span>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isFree ? 'var(--green)' : isMe ? 'var(--blue)' : 'var(--red)',
                  boxShadow: isFree ? '0 0 6px var(--green)' : isMe ? '0 0 6px var(--blue)' : '0 0 6px var(--red)'
                }} />
              </div>

              {/* Status info */}
              {isFree ? (
                <p style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Available</p>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'var(--blue)' : 'var(--text)' }}>
                    {charger.occupant} {isMe && '(you)'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                    {charger.occupantReg} · {timeSince(charger.since)} ago
                  </p>
                  {charger.targetPercent && (
                    <p style={{ fontSize: 11, color: 'var(--amber)', marginTop: 2 }}>
                      Target: {charger.targetPercent}%
                    </p>
                  )}
                  {charger.note && (
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontStyle: 'italic' }}>
                      "{charger.note}"
                    </p>
                  )}
                </div>
              )}

              {/* Action button */}
              {isFree && !myCharger && (
                <button
                  onClick={() => handleStartClick(charger.id)}
                  style={{ width: '100%', background: 'var(--green)', color: '#0a1a0a', padding: '8px', fontWeight: 600 }}
                >
                  Start charging
                </button>
              )}
              {isMine && (
                <button
                  onClick={() => onStop(charger.id)}
                  style={{ width: '100%', background: 'rgba(255,82,82,0.15)', color: 'var(--red)', border: '1px solid rgba(255,82,82,0.3)', padding: '8px' }}
                >
                  Stop & release
                </button>
              )}
              {isFree && myCharger && (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>You're already charging</p>
              )}
            </div>
          )
        })}
      </div>

      {modalCharger && (
        <StartModal
          chargerId={modalCharger}
          onConfirm={handleConfirm}
          onClose={() => setModalCharger(null)}
        />
      )}
    </div>
  )
}
