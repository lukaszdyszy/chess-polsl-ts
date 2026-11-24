import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import './MainMenu.scss';
import { clearSession } from '../../reducers/auth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? 'MainMenu-link active' : 'MainMenu-link';

const MainMenu = () => {
	const dispatch = useAppDispatch();

	const loggedUser = useAppSelector(state => state.auth.loggedUser)!;

	const signOut = () => {
		dispatch(clearSession());
	}

	return (
		<nav className="MainMenu">
			<div className="MainMenu-brand">
				<span className="MainMenu-brand-mark">♔</span>
				<span className="MainMenu-brand-name">Chess POLSL</span>
			</div>
			<div className="MainMenu-links">
				<NavLink to="/" end className={linkClass}>Play</NavLink>
				<NavLink to="/profile" className={linkClass}>Profile</NavLink>
				<NavLink to="/game-history" className={linkClass}>Game history</NavLink>
			</div>
			<div className="MainMenu-user">
				<span className="MainMenu-user-name">{loggedUser.username}</span>
				<span className="MainMenu-user-signout" onClick={signOut}>Sign out</span>
			</div>
		</nav>
	);
}

export default MainMenu;
