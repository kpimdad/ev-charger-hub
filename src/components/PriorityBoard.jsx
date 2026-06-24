import { useState } from 'react'

const PRIORITY_TYPES = [
  { value: 'emergency', label: '🚨 Emergency', desc: 'Hospital visit, family emergency', color: 'var(--red)', bg: 'rgba(255,82,82,0.1)', border: 'rgba(255,82,82,0.35)' },
  { value: 'urgent', label: '⏰ Time-sensitive', desc: 'Need X% charge by a deadline', color: 'var(--amber)', bg: 'rgba(255,171,0,0.08)', border: 'rgba(255,171,0,0.3)' },
  { value: 'personal', label: '📋 Personal note', desc: 'FYI for the team', color: 'var(--blue)', bg: 'rgba(68,138,255,0.08)', border: 'rgba(68,138,255,0.25)' },
]

function timeAgo(ts) {
  if (!ts) return ''
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export default function PriorityBoard({ priorities, user, onAdd, onRemove }) {
  const [type, setType] = useState('emergency')
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState('')
  const [showForm, setShowForm] = useState(false)

  const myPriority = priorities.find(p => p.name === user.name)

  const handlePost = async () => {
    if (!message.trim()) return
    await onAdd(type, message.trim(), deadline)
    setShowForm(false)
    setMessage(''); setDeadline(''); setType('emergency')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 18 }}>Priority Board</h2>
        {!myPriority && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ background: 'rgba(255,82,82,0.15)', color: 'var(--red)', border: '1px solid rgba(255,82,82,0.3)', padding: '8px 14px' }}
          >
            + Post priority
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
        Emergency and time-sensitive charging needs visible to everyone.
      </p>

      {/* Post form */}
      {showForm && !myPriority && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 20, marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <h3 style={{ fontSize: 15 }}>Post priority request</h3>

          {/* Type selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRIORITY_TYPES.map(pt => (
              <label key={pt.value} style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                background: type === pt.value ? pt.bg : 'var(--surface2)',
                border: `1px solid ${type === pt.value ? pt.border : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                transition: 'all 0.15s'
              }}>
                <input type="radio" value={pt.value} checked={type === pt.value} onChange={() => setType(pt.value)} style={{ accentColor: pt.color, width: 'auto' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: type === pt.value ? pt.color : 'var(--text)' }}>{pt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{pt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>MESSAGE *</label>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. Hospital visit at 6pm, need 80% by 5:30"
            />
          </div>

          {(type === 'urgent' || type === 'emergency') && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NEED CHARGE BY</label>
              <input type="time" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text-dim)', padding: 10 }}>Cancel</button>
            <button
              onClick={handlePost}
              disabled={!message.trim()}
              style={{ flex: 2, background: 'var(--red)', color: '#fff', padding: 10, fontWeight: 700 }}
            >
              Post to board
            </button>
          </div>
        </div>
      )}

      {/* Priority list */}
      {priorities.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: 40 }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>✅</p>
          <p>No priority requests right now</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {priorities.map(p => {
            const pt = PRIORITY_TYPES.find(t => t.value === p.type) || PRIORITY_TYPES[2]
            const isMe = p.name === user.name
            return (
              <div key={p.id} style={{
                background: pt.bg,
                border: `1.5px solid ${pt.border}`,
                borderRadius: 'var(--radius)',
                padding: 18
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pt.color, background: pt.bg, border: `1px solid ${pt.border}`, padding: '2px 8px', borderRadius: 10 }}>
                        {pt.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{timeAgo(p.createdAt)}</span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{p.name} · <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>{p.reg}</span></p>
                    <p style={{ fontSize: 14, color: 'var(--text)' }}>{p.message}</p>
                    {p.deadline && (
                      <p style={{ fontSize: 13, color: pt.color, marginTop: 6, fontWeight: 600 }}>
                        ⏰ Needs charge by {p.deadline}
                      </p>
                    )}
                  </div>
                  {isMe && (
                    <button
                      onClick={() => onRemove(p.id)}
                      style={{ background: 'rgba(255,82,82,0.15)', color: 'var(--red)', border: '1px solid rgba(255,82,82,0.3)', padding: '6px 12px', fontSize: 12, marginLeft: 12, flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
