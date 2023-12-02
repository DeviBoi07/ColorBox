import { useState } from "react";

export default function useStepper() {
	const [activePage, setActivePage] = useState(0);
	const nextPage = () => setActivePage((prev) => prev + 1);
	const prevPage = () => setActivePage((prev) => prev - 1);

	return { activePage, nextPage, prevPage };
}
