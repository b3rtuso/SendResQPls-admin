import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText,
  BarChart3, Building2, LogOut, X,
} from 'lucide-react';
import { FaCog } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { useAdminNav } from '../context/AdminNavContext';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard,  label: 'Dashboard'   },
  { to: '/requests',    icon: FileText,         label: 'Requests'    },
  { to: '/call-logs',   icon: FiPhone,          label: 'Call Logs'   },
  { to: '/analytics',  icon: BarChart3,         label: 'Analytics'   },
  { to: '/departments', icon: Building2,        label: 'Departments' },
  { to: '/settings',   icon: FaCog,             label: 'Settings'    },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar } = useAdminNav();
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'MDRRMO Admin');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUserName(localStorage.getItem('userName') || 'MDRRMO Admin');
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  useEffect(() => {
    if (!showLogoutModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showLogoutModal]);

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    ['token', 'userId', 'userName', 'userEmail', 'userRole'].forEach(k => localStorage.removeItem(k));
    setShowLogoutModal(false);
    closeSidebar();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sb-backdrop"
          onClick={closeSidebar}
          aria-label="Close navigation drawer"
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <style>{`
          .app-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 260px;
            background: linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%);
            display: flex;
            flex-direction: column;
            z-index: 1001;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            font-family: 'Geist', 'Inter', system-ui, sans-serif;
            user-select: none;
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .sb-backdrop {
            display: none;
          }

          .sb-mobile-close {
            display: none;
          }

          @media (min-width: 1025px) and (max-width: 1366px) {
            .app-sidebar {
              width: 210px;
            }
            .sb-brand {
              padding: 16px 14px 14px;
              gap: 10px;
            }
            .sb-brand-title {
              font-size: 13.5px;
            }
            .sb-brand-sub {
              font-size: 10px;
            }
            .sb-nav-container {
              padding: 4px 8px;
            }
            .sb-nav-item {
              padding: 8px 10px;
              font-size: 12.5px;
              gap: 9px;
            }
            .sb-nav-icon-box {
              width: 26px;
              height: 26px;
            }
            .sb-section-label {
              padding: 12px 10px 4px;
              font-size: 9.5px;
            }
            .sb-footer {
              padding: 10px 10px 14px;
            }
            .sb-signout-btn {
              padding: 8px 10px;
              font-size: 12px;
              margin-bottom: 8px;
            }
            .sb-user-card {
              padding: 8px 10px;
            }
            .sb-user-avatar {
              width: 32px;
              height: 32px;
              font-size: 12px;
            }
            .sb-user-name {
              font-size: 12px;
            }
          }

          @media (max-width: 1024px) {
            .app-sidebar {
              transform: translateX(-100%);
              box-shadow: none;
            }
            .app-sidebar.open {
              transform: translateX(0);
              box-shadow: 12px 0 40px rgba(0, 0, 0, 0.45);
            }
            .sb-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(15, 23, 42, 0.65);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
              z-index: 1000;
              animation: fadeIn 0.2s ease both;
            }
            .sb-mobile-close {
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 10px;
              width: 32px;
              height: 32px;
              color: white;
              cursor: pointer;
              margin-left: auto;
              padding: 0;
            }
          }

          .sb-brand {
            padding: 24px 20px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .sb-logo-box {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            overflow: hidden;
            flex-shrink: 0;
            border: 1.5px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          }

          .sb-logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .sb-brand-title {
            color: #FFFFFF;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: -0.3px;
            line-height: 1.15;
          }

          .sb-brand-sub {
            color: rgba(255, 255, 255, 0.45);
            font-size: 11px;
            font-weight: 500;
            margin-top: 3px;
            letter-spacing: 0.01em;
          }

          .sb-section-label {
            font-size: 10.5px;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.35);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            padding: 20px 16px 8px;
          }

          .sb-nav-container {
            flex: 1;
            padding: 6px 12px;
            overflow-y: auto;
          }

          .sb-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 12px;
            margin-bottom: 4px;
            text-decoration: none;
            font-size: 13.5px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.6);
            position: relative;
            transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .sb-nav-item:hover {
            background: rgba(255, 255, 255, 0.07);
            color: #FFFFFF;
            transform: translateX(2px);
          }

          .sb-nav-item.active {
            background: rgba(255, 255, 255, 0.09);
            color: #FFFFFF;
            font-weight: 700;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
          }

          .sb-nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 16%;
            bottom: 16%;
            width: 4px;
            border-radius: 0 4px 4px 0;
            background: linear-gradient(180deg, #FBBF24, #F59E0B, #D97706);
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          }

          .sb-nav-icon-box {
            width: 30px;
            height: 30px;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.15s ease;
            border: 1px solid rgba(255, 255, 255, 0.06);
          }

          .sb-nav-item.active .sb-nav-icon-box {
            background: rgba(245, 158, 11, 0.18);
            border-color: rgba(245, 158, 11, 0.45);
            color: #FBBF24;
            box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25);
          }

          .sb-footer {
            padding: 14px 14px 18px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.12);
          }

          .sb-signout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 10px;
            margin-bottom: 10px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.08);
            cursor: pointer;
            color: rgba(255, 255, 255, 0.55);
            font-size: 13px;
            font-weight: 600;
            font-family: inherit;
            transition: all 0.15s ease;
          }

          .sb-signout-btn:hover {
            background: rgba(239, 68, 68, 0.14);
            border-color: rgba(239, 68, 68, 0.3);
            color: #FCA5A5;
          }

          .sb-user-card {
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 10px 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .sb-user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #1D4ED8, #2563EB);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
            color: #FFFFFF;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .sb-user-name {
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sb-user-email {
            color: rgba(255, 255, 255, 0.4);
            font-size: 11px;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          @keyframes modalOverlayFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalCenterPop {
            from {
              opacity: 0;
              transform: scale(0.92) translateY(16px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        {/* Brand Header */}
        <div className="sb-brand">
          <div className="sb-logo-box">
            <img src="/logo.jpg" alt="SendResQPls" className="sb-logo-img" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sb-brand-title">SendResQPls</div>
            <div className="sb-brand-sub">MDRRMO BALAYAN</div>
          </div>
          <button className="sb-mobile-close" onClick={closeSidebar} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sb-nav-container">
          <div className="sb-section-label">Main Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) => `sb-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="sb-nav-icon-box">
                  <Icon size={16} />
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="sb-footer">
          <button
            className="sb-signout-btn"
            onClick={handleLogout}
            aria-label="Sign out of admin session"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>

          <div className="sb-user-card">
            <div className="sb-user-avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sb-user-name" title={userName}>{userName}</div>
              <div className="sb-user-email" title={userEmail || 'Administrator'}>
                {userEmail || 'Administrator'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal matching Mobile Design */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'modalOverlayFade 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 340,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: '28px 22px 22px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 10px 20px -5px rgba(15, 23, 42, 0.1)',
              animation: 'modalCenterPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h2 style={{
              color: '#0F1F38',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.3,
              margin: '0 0 20px',
              letterSpacing: '-0.3px',
            }}>
              Are you sure you<br />want to log out?
            </h2>

            {/* Profile identity box — matching mobile blue theme */}
            <div style={{
              background: '#F0F7FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              marginBottom: 22,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(29, 78, 216, 0.25)',
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  color: '#0F1F38',
                  fontWeight: 800,
                  fontSize: 15.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}>
                  {userName || 'MDRRMO Admin'}
                </div>
                <div style={{
                  color: '#1D4ED8',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 3,
                }}>
                  {userEmail || 'Administrator'}
                </div>
              </div>
            </div>

            {/* Actions: Red Log out & White Cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={executeLogout}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  color: '#334155',
                  fontSize: 15,
                  fontWeight: 700,
                  border: '1.5px solid #E2E8F0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
