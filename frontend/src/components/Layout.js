import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
	return (
		<div className="bg-primary">
			<Header />
			<div className="h-auto">{children}</div>
			<Footer />
		</div>
	);
}
