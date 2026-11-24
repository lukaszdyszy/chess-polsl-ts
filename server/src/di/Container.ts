import { TypedToken } from "./tokens.js";

type Factory<T> = (container: Container) => T;

interface Registration<T> {
	factory: Factory<T>;
	lifetime: 'singleton' | 'transient';
	instance?: T;
}

class Container {
	private registrations = new Map<TypedToken<unknown>, Registration<unknown>>();

	register<T>(
		token: TypedToken<T>,
		factory: Factory<T>,
		lifetime: 'singleton' | 'transient' = 'singleton'
	) {
		this.registrations.set(token, { factory, lifetime });
	}

	resolve<T>(token: TypedToken<T>): T {
		const registration = this.registrations.get(token) as Registration<T> | undefined;

		if (!registration) {
			throw new Error(`No registration found for token: ${String(token)}`);
		}

		if (registration.lifetime === 'singleton') {
			if (!registration.instance) {
				registration.instance = registration.factory(this);
			}
			return registration.instance;
		}

		return registration.factory(this);
	}
}

export default Container;