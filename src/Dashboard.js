import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateUser = location.state?.user;
  const storedUserRaw = stateUser ? null : sessionStorage.getItem("user");
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const user = stateUser || storedUser;

  if (!user) return <Navigate to="/" replace />;

  function handleLogOut() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/", { replace: true });
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>SEP</div>
        <nav>
          <ul className={styles.sidebarList}>
            <li>
              <NavLink
                to="requests"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Event Requests List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="requests/new"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Create New Event Request
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className={styles.spacer} />
        <div className={styles.userBox}>
          <div className={styles.userName} title={user?.name || user?.email}>
            {user?.name ?? user?.email ?? "User"}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogOut}>
            Log out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.h1}>Dashboard</h1>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
