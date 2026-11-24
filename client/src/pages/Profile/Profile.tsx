import { useAppSelector } from '../../store';
import { UserInfo } from '../../reducers/auth';
import './Profile.scss';

const fallbackUser: UserInfo = {
	id: 1,
	username: 'master',
	email: 'master@abc.com',
	statistics: {
		elo: 1500
	}
};

const Profile = () => {
	const loggedUser = useAppSelector(state => state.auth.loggedUser) ?? fallbackUser;
	const initial = loggedUser.username.charAt(0).toUpperCase();

	return (
		<div className="Profile">
			<section className="Profile-card">
				<div className="Profile-avatar" aria-hidden="true">{initial}</div>
				<div className="Profile-identity">
					<h1 className="Profile-username">{loggedUser.username}</h1>
					<p className="Profile-email">{loggedUser.email}</p>
				</div>
				<div className="Profile-elo">
					<span className="Profile-elo-value">{loggedUser.statistics.elo}</span>
					<span className="Profile-elo-label">Elo</span>
				</div>
			</section>
			<section className="Profile-details">
				<div className="Profile-detail">
					<span className="Profile-detail-label">Username</span>
					<span className="Profile-detail-value">{loggedUser.username}</span>
				</div>
				<div className="Profile-detail">
					<span className="Profile-detail-label">Email</span>
					<span className="Profile-detail-value">{loggedUser.email}</span>
				</div>
				<div className="Profile-detail">
					<span className="Profile-detail-label">Rating</span>
					<span className="Profile-detail-value">{loggedUser.statistics.elo}</span>
				</div>
			</section>
		</div>
	);
}

export default Profile;
