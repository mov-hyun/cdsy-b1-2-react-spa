import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        본문으로 이동
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="book" size={25} />
          </span>
          <span>
            배움노트<small>MY LEARNING JOURNAL</small>
          </span>
        </Link>
        <p className="nav-label">나의 학습 공간</p>
        <nav aria-label="주요 메뉴">
          <NavLink to="/" end>
            <Icon name="home" />
            대시보드
          </NavLink>
          <NavLink to="/records" end>
            <Icon name="grid" />
            모든 기록
          </NavLink>
          <NavLink to="/records/new">
            <Icon name="edit" />새 기록 작성
          </NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="note-doodle">✳</span>
          <strong>작은 배움도, 차곡차곡.</strong>
          <p>
            오늘의 한 줄이
            <br />
            내일의 나를 만듭니다.
          </p>
        </div>
        <NavLink to="/guide" className="guide-link">
          <Icon name="help" />
          이용 안내
        </NavLink>
        <div className="workspace-label">
          <span className="avatar">나</span>
          <span>
            나의 기록장<small>이 브라우저의 학습 공간</small>
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>기록하고, 돌아보고, 성장하기</span>
          <Button to="/records/new" variant="secondary">
            <Icon name="plus" size={17} />새 기록
          </Button>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          <div className="page-transition" key={pathname}>
            <Outlet />
          </div>
        </main>
        <footer>
          배움노트 <span>작은 배움이 쌓이는 곳.</span>
        </footer>
      </div>
    </div>
  );
}
