document.addEventListener('DOMContentLoaded', () => {
	const cards = Array.from(document.querySelectorAll('.card'));

	if (!cards.length) return;

	// Open URL helper — opens in same tab
	function openCardLink(url) {
		if (!url) return;
		window.location.href = url;
	}

	// Track pointer to avoid treating drags/selections as clicks
	let pointerDownPos = null;

	cards.forEach(card => {
		const link = card.getAttribute('data-link');

		card.addEventListener('click', (ev) => {
			// Ignore if modifier keys are used (let user open context menu or new tab)
			if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

			// If pointer moved a lot since pointerdown, don't navigate
			if (pointerDownPos) {
				const dx = Math.abs(pointerDownPos.x - (ev.pageX || 0));
				const dy = Math.abs(pointerDownPos.y - (ev.pageY || 0));
				if (dx > 8 || dy > 8) return;
			}

			openCardLink(link);
		});

		// Keyboard accessibility: Enter or Space should activate
		card.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				openCardLink(link);
			}
		});

		// pointerdown/up to detect drags
		card.addEventListener('pointerdown', (ev) => {
			pointerDownPos = { x: ev.pageX, y: ev.pageY };
		});
		card.addEventListener('pointerup', () => { pointerDownPos = null; });
		card.addEventListener('pointercancel', () => { pointerDownPos = null; });

		// Prevent text selection drag from selecting inner text while interacting
		card.addEventListener('dragstart', (ev) => ev.preventDefault());
	});
});
