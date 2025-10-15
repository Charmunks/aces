// document.addEventListener('DOMContentLoaded', () => {
const params = new URLSearchParams(window.location.search); // gets the parameters from the link
const cards = Array.from(document.querySelectorAll('.card'));
let hasReferral = Boolean(params.get("ref")); // checks if theres a referral
let url; // define first so we can access later

// does it have a referral? if yes -> put the ref parameter in the form
if (hasReferral) {
	url = `https://forms.hackclub.com/aces-rsvp?ref=${params.get("ref")}`
}
// otherwise, set the raw link and do nothing
else {
	url = "https://forms.hackclub.com/aces-rsvp"
}

// replace all links with the current url constructed above
cards.forEach(card => {
		card.setAttribute("data-link", url)
})

// Fetch and display RSVP count
const rsvpEl = document.getElementById('rsvp-count');

if (rsvpEl) {
	const API = 'https://aces.femboyin.tech/count';
	let attempts = 0;
	const maxAttempts = 3;

	function showFallback(message) {
		rsvpEl.textContent = message;
	}

	function renderCount(count) {
		const total = 750;
		rsvpEl.textContent = `RSVPs: ${count} / ${total}. We need 750 RSVPs to launch!`;
	}

	async function fetchCount() {
		attempts += 1;
		try {
			const res = await fetch(API, { cache: 'no-store' });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (data && typeof data.record_count === 'number') {
				renderCount(data.record_count);
			} else {
				showFallback('RSVP: — / 750');
			}
		} catch (err) {
			// If a direct fetch fails (CORS/network), try the local proxy once
			if (attempts === 1) {
				console.info('Direct fetch failed, attempting local proxy fallback:', err);;
			}
			if (attempts < maxAttempts) {
				setTimeout(fetchCount, 500 * attempts);
			} else {
				console.warn('Failed to fetch RSVP count:', err);
				showFallback('RSVP: unavailable');
			}
		}
	}

	fetchCount();
}

// if (!cards.length) return;

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
// });
