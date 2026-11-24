export default class ApiResponse {
	private readonly status: 'success' | 'error' = 'success';
	private readonly message: string = '';
	private readonly data: [] | {} | null = null;

	constructor(status: 'success' | 'error' = 'success', message: string = '', data: [] | {} | null = null) {
		this.status = status;
		this.message = message;
		this.data = data;
	}

	public getStatus(): 'success' | 'error' {
		return this.status;
	}

	public getMessage(): string {
		return this.message;
	}

	public getData(): [] | {} | null {
		return this.data;
	}
}