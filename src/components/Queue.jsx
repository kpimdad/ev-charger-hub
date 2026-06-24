import { useState } from 'react'

export default function Queue({ queue, user, myQueuePos, freeCount, onJoin, onLeave }) {
  const [targetPercent, setTargetPercent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [note, setNote] = useState('')
  const [priorityType, setPriorityType] = useState('normal')
  const [showForm, setShowForm] = useState(false)

  const inQueue = myQueuePos >= 0

  const handleJoin = async () => {
    await onJoin(targetPercent, deadline, note, priorityType)
    setShowForm(false)
    setTargetPercent(''); setDeadline(''); setNote(''); setPriorityType('normal')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18 }}>Waiting Queue</h2>
        {!inQueue && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ background: 'var(--blue)', color: '#fff', padding: '8px 16px' }}
          >
            + Join queue
          </button>
        )}
      </div>

      {/* Join form */}
      {showForm && !inQueue && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 20, marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <h3 style={{ fontSize: 15 }}>Join the queue</h3>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>PRIORITY TYPE</label>
            <select value={priorityType} onChange={e => setPriorityType(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgent">⏰ Time-sensitive</option>
              <option value="emergency">🚨 Emergency</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>TARGET % (optional)</label>
            <input type="number" min="10" max="100" value={targetPercent} onChange={e => setTargetPercent(e.target.value)} placeholder="e.g. 50" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NEED BY (optional)</label>
            <input type="time" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NOTE (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Hospital visit tonight" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text-dim)', padding: 10 }}>Cancel</button>
            <button onClick={handleJoin} style={{ flex: 2, background: 'var(--blue)', color: '#fff', padding: 10, fontWeight: 700 }}>Join queue</button>
          </div>
        </div>
      )}

      {/* My queue status */}
      {inQueue && (
        <div style={{
          background: 'rgba(68,138,255,0.08)', border: '1px solid rgba(68,138,255,0.25)',
          borderRadius: 'var(--radius)', padding: 16, marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <p style={{ color: 'var(--blue)', fontWeight: 600 }}>You are #{myQueuePos + 1} in queue</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              {freeCount > 0 ? 'A charger is available now!' : 'You\'ll be notified when a charger is free'}
            </p>
          </div>
          <button
            onClick={onLeave}
            style={{ background: 'rgba(255,82,82,0.15)', color: 'var(--red)', border: '1px solid rgba(255,82,82,0.3)', padding: '8px 14px', fontSize: 13 }}
          >
            Leave
          </button>
        </div>
      )}

      {/* Queue list */}
      {queue.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: 40 }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🟢</p>
          <p>No one waiting — chargers are flowing!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {queue.map((entry, idx) => (
            <div key={entry.id} style={{
              background: 'var(--surface)',
              border: `1px solid ${entry.priorityType === 'emergency' ? 'rgba(255,82,82,0.4)' : entry.priorityType === 'urgent' ? 'rgba(255,171,0,0.4)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20,
                  color: 'var(--text-dim)', minWidth: 28
                }}>
                  {idx + 1}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{entry.name}</span>
                    {entry.priorityType === 'emergency' && <span style={{ fontSize: 11, background: 'rgba(255,82,82,0.2)', color: 'var(--red)', padding: '1px 7px', borderRadius: 10 }}>🚨 EMERGENCY</span>}
                    {entry.priorityType === 'urgent' && <span style={{ fontSize: 11, background: 'rgba(255,171,0,0.15)', color: 'var(--amber)', padding: '1px 7px', borderRadius: 10 }}>⏰ URGENT</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    {entry.reg}
                    {entry.targetPercent && ` · ${entry.targetPercent}%`}
                    {entry.deadline && ` · by ${entry.deadline}`}
                  </p>
                  {entry.note && <p style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 2 }}>"{entry.note}"</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
