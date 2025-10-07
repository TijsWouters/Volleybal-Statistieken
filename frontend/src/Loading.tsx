import VOLLEYBALL_IMAGE from './assets/volleyball.png';

export default function Loading() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 2rem)' }}>
			<img className="rotate" src={VOLLEYBALL_IMAGE} alt="Loading..." />
		</div>
	);
}