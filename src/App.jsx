import { useState, useEffect } from 'react'
import { db, messaging, getToken, onMessage, VAPID_KEY } from './firebase'
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  deleteDoc, serverTimestamp, query, orderBy, getDoc
} from 'firebase/firestore'
import ChargerGrid from './components/ChargerGrid.jsx'
import Queue from './components/Queue.jsx'
import PriorityBoard from './components/PriorityBoard.jsx'
import LoginModal from './components/LoginModal.jsx'

const TOTAL_CHARGERS = 8

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ev_user')
    return saved ? JSON.parse(saved) : null
  })
  const [chargers, setChargers] = useState(
    Array.from({ length: TOTAL_CHARGERS }, (_, i) => ({ id: i + 1, status: 'free', occupant: null, since: null, targetPercent: null, note: null }))
  )
  const [queue, setQueue] = useState([])
  const [priorities, setPriorities] = useState([])
  const [activeTab, setActiveTab] = useState('chargers')
  const [toast, setToast] = useState(null)
  const [notifEnabled, setNotifEnabled] = useState(false)

  // Request notification permission and save FCM token
  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { showToast('Notifications blocked', 'error'); return }
      const token = await getToken(messaging, { vapidKey: VAPID_KEY })
      if (token) {
        await setDoc(doc(db, 'fcmTokens', token), {
          token,
          email: user?.email || 'unknown',
          updatedAt: serverTimestamp()
        })
        setNotifEnabled(true)
        showToast('Notifications enabled')
      }
    } catch (e) {
      console.error('Notification setup failed', e)
      showToast('Could not enable notifications', 'error')
    }
  }

  // Handle foreground messages
  useEffect(() => {
    const unsub = onMessage(messaging, payload => {
      showToast(`${payload.notification?.title}: ${payload.notification?.body}`, 'info')
    })
    return unsub
  }, [])

  // Real-time listeners
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'chargers'), snap => {
      const data = Array.from({ length: TOTAL_CHARGERS }, (_, i) => {
        const d = snap.docs.find(d => d.id === String(i + 1))
        return d ? { id: i + 1, ...d.data() } : { id: i + 1, status: 'free', occupant: null, since: null, targetPercent: null, note: null }
      })
      setChargers(data)
    })

    const unsub2 = onSnapshot(query(collection(db, 'queue'), orderBy('joinedAt')), snap => {
      setQueue(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsub3 = onSnapshot(query(collection(db, 'priorities'), orderBy('createdAt', 'desc')), snap => {
      setPriorities(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogin = (userData) => {
    localStorage.setItem('ev_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('ev_user')
    setUser(null)
  }

  const startCharging = async (chargerId, targetPercent, note) => {
    await setDoc(doc(db, 'chargers', String(chargerId)), {
      status: 'occupied',
      occupant: user.name,
      occupantEmail: user.email,
      occupantReg: user.reg,
      since: serverTimestamp(),
      targetPercent: targetPercent || null,
      note: note || null
    })
    // Remove from queue if they were in it
    const qEntry = queue.find(q => q.email === user.email)
    if (qEntry) await deleteDoc(doc(db, 'queue', qEntry.id))
    showToast(`Charger ${chargerId} started ⚡`)
  }

  const stopCharging = async (chargerId) => {
    await deleteDoc(doc(db, 'chargers', String(chargerId)))
    showToast(`Charger ${chargerId} released`)
    if (queue.length > 0) {
      showToast(`🔔 ${queue[0].name} — a charger is now free!`, 'info')
    }
  }

  const joinQueue = async (targetPercent, deadline, note, priorityType) => {
    const already = queue.find(q => q.email === user.email)
    if (already) { showToast('You are already in the queue', 'error'); return }
    await setDoc(doc(db, 'queue', user.email), {
      name: user.name,
      email: user.email,
      reg: user.reg,
      joinedAt: serverTimestamp(),
      targetPercent: targetPercent || null,
      deadline: deadline || null,
      note: note || null,
      priorityType: priorityType || 'normal'
    })
    showToast('Added to queue')
  }

  const leaveQueue = async () => {
    await deleteDoc(doc(db, 'queue', user.email))
    showToast('Removed from queue')
  }

  const addPriority = async (type, message, deadline) => {
    await setDoc(doc(db, 'priorities', `${user.email}_${Date.now()}`), {
      name: user.name,
      email: user.email,
      reg: user.reg,
      type,
      message,
      deadline: deadline || null,
      createdAt: serverTimestamp()
    })
    showToast('Priority request posted')
  }

  const removePriority = async (id) => {
    await deleteDoc(doc(db, 'priorities', id))
  }

  const freeCount = chargers.filter(c => c.status === 'free').length
  const myCharger = chargers.find(c => c.occupantEmail === user?.email)
  const myQueuePos = queue.findIndex(q => q.email === user?.email)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>EV Charger Hub</span>
            <span style={{
              background: freeCount > 0 ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)',
              color: freeCount > 0 ? 'var(--green)' : 'var(--red)',
              fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20
            }}>
              {freeCount}/{TOTAL_CHARGERS} free
            </span>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{user.name}</span>
              <button
                onClick={enableNotifications}
                title={notifEnabled ? 'Notifications on' : 'Enable notifications'}
                style={{
                  background: notifEnabled ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
                  color: notifEnabled ? 'var(--green)' : 'var(--text-dim)',
                  padding: '5px 8px', fontSize: 14, border: 'none', borderRadius: 6
                }}
              >🔔</button>
              <button onClick={handleLogout} style={{ background: 'var(--surface2)', color: 'var(--text-dim)', padding: '5px 10px', fontSize: 12 }}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      {/* Status bar for current user */}
      {user && (myCharger || myQueuePos >= 0) && (
        <div style={{
          background: myCharger ? 'rgba(0,230,118,0.08)' : 'rgba(68,138,255,0.08)',
          borderBottom: `1px solid ${myCharger ? 'rgba(0,230,118,0.2)' : 'rgba(68,138,255,0.2)'}`,
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: 13,
          color: myCharger ? 'var(--green)' : 'var(--blue)'
        }}>
          {myCharger
            ? `⚡ You are charging on Charger ${myCharger.id}${myCharger.targetPercent ? ` · Target: ${myCharger.targetPercent}%` : ''}`
            : `🕐 Queue position: #${myQueuePos + 1} of ${queue.length}`
          }
        </div>
      )}

      {/* Tabs */}
      {user && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 0 }}>
            {['chargers', 'queue', 'priority'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: 'none',
                color: activeTab === tab ? 'var(--blue)' : 'var(--text-dim)',
                borderBottom: activeTab === tab ? '2px solid var(--blue)' : '2px solid transparent',
                borderRadius: 0,
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                textTransform: 'capitalize'
              }}>
                {tab === 'chargers' ? `⚡ Chargers` : tab === 'queue' ? `🕐 Queue ${queue.length > 0 ? `(${queue.length})` : ''}` : `🚨 Priority ${priorities.length > 0 ? `(${priorities.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 80px' }}>
        {!user ? (
          <LoginModal onLogin={handleLogin} />
        ) : activeTab === 'chargers' ? (
          <ChargerGrid
            chargers={chargers}
            user={user}
            myCharger={myCharger}
            onStart={startCharging}
            onStop={stopCharging}
            onJoinQueue={joinQueue}
          />
        ) : activeTab === 'queue' ? (
          <Queue
            queue={queue}
            user={user}
            myQueuePos={myQueuePos}
            freeCount={freeCount}
            onJoin={joinQueue}
            onLeave={leaveQueue}
          />
        ) : (
          <PriorityBoard
            priorities={priorities}
            user={user}
            onAdd={addPriority}
            onRemove={removePriority}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'var(--red)' : toast.type === 'info' ? 'var(--blue)' : '#1e3a2f',
          border: `1px solid ${toast.type === 'error' ? '#ff1744' : toast.type === 'info' ? '#2979ff' : 'var(--green)'}`,
          color: 'var(--text)',
          padding: '12px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 999, whiteSpace: 'nowrap'
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
