import { useRef, useState } from "react";
import { signIn } from "../../communication/authCommunication";
import { useAppDispatch } from "../../store";
import { loadLoggedUser } from "../../reducers/auth";
import './Login.scss';

const Login = () => {
	const dispatch = useAppDispatch();

	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	const [errorMessage, setErrorMessage] = useState('');

	const submit = async () => {
		const username = usernameRef.current?.value ?? '';
		const password = passwordRef.current?.value ?? '';

		const loginResp = await signIn(username, password);

		if (loginResp) {
			if (loginResp.status === 'error') {
				setErrorMessage(loginResp.message);
			} else {
				setErrorMessage('');
				dispatch(loadLoggedUser());
			}
		}
	}

	return (
		<div className="Login-container">
			<span className="login-error-message">{errorMessage}</span>
			<form className="login-form" onSubmit={e => { e.preventDefault(); submit(); }}>
				<input
					className="login-form-input"
					placeholder="Username"
					ref={usernameRef}
					type="text"
					name="username"
					required
				/>
				<input
					className="login-form-input"
					placeholder="Password"
					ref={passwordRef}
					type="password"
					name="password"
					required
					minLength={8}
					maxLength={20}
				/>
				<input type="submit" value="Sign in" className="login-form-input" />
			</form>
		</div>
	);
}
export default Login;