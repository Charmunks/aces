// document.addEventListener('DOMContentLoaded', () => {
const params = new URLSearchParams(window.location.search); // gets the parameters from the link
const cards = Array.from(document.querySelectorAll('.card'));
const modalExit = document.getElementById("exit")
const modalHeaderObj = document.getElementById("modal-header")
const modalContentObj = document.getElementById("modal-content")
const modal = document.getElementById("modal")
const body = document.body
const modalContent = {
	"card-develop": {"title": "Develop", "content": "Spend 40 hours building a digital card game like Slay the Spire!"},
	"card-build": {"title": "Build", "content": "Get a grant to order the materials for your game, and then assemble it IRL!"},
	"card-share": {"title": "Share", "content": "Get flown out to Washington DC and show off your game to the public at AwesomeCon!"},
	"card-improve": {"title": "Improve", "content": "Take part in a 48 hour hackathon to improve your game based on feedback from AwesomeCon!"},
	"card-learnmore": {"title": "Learn more", "content": "Click on any card to learn more, or check in the canvas in #aces channel on the Hack Club Slack!"}
};
let hasReferral = Boolean(params.get("ref")); // checks if theres a referral
let url; // define first so we can access later
let valid = false;

if (hasReferral && isNaN(Number(params.get("ref")))) {
    hasReferral = false;
}

if (hasReferral) {
(async () => { // this whole chunk is to validate it with our backend
await fetch(`/api/referral?referral=${params.get("ref")}`)
  .then((r) => r.json())
  .then((data) => {
	console.log(data)
    if (!("valid" in data)) { throw new Error(); }
	if (data.valid || params.get("ref") == "happenings") {
		valid = true
	}
    else {
		valid = false
	}
  })
  .catch(console.error)
  if (hasReferral && valid) {
	url = `https://forms.hackclub.com/aces-rsvp?ref=${params.get("ref")}`
  }
  // otherwise, set the raw link and do nothing
  else {
	url = "https://forms.hackclub.com/aces-rsvp"
}
cards.forEach(card => {
	card.setAttribute("data-link", url);
	card.addEventListener("click", function(event) {
		let id = this.id
		modalHeaderObj.textContent = modalContent[id]["title"]
		modalContentObj.textContent = modalContent[id]["content"]
		modal.classList.add("active");
		body.style.overflow = "hidden";
	})
})
}

)()};

// const valid = (async() => {await fetch(`/api/referral?referral=${refCode}`)
//   .then((r) => r.json())
//   .then((data) => {
// 	console.log(data)
//     if (!("valid" in data)) { throw new Error(); }
//     return data.valid
//   })
//   .catch(console.error)})

// does it have a referral and is it a valid referral? if yes -> put the ref parameter in the form


modalExit.addEventListener("click", function(event) {
	modal.classList.remove("active");
	body.style.overflow = "auto";
})

// replace all links with the current url constructed above

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
		rsvpEl.textContent = `RSVPs: ${count} / ${total}. We need 750 RSVPs to launch! (click to RSVP!)`;
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
		// Keep cards non-navigable here so the RSVP action is attached to the footer
		// (click/key activation intentionally does not open the card's data-link)
		const link = card.getAttribute('data-link');

		card.addEventListener('click', (ev) => {
			// Preserve modifier-key behavior (do nothing special here)
			if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

			// If pointer moved a lot since pointerdown, ignore
			if (pointerDownPos) {
				const dx = Math.abs(pointerDownPos.x - (ev.pageX || 0));
				const dy = Math.abs(pointerDownPos.y - (ev.pageY || 0));
				if (dx > 8 || dy > 8) return;
			}

			// Intentionally not navigating here — RSVP link lives on the footer
		});

		// Keyboard accessibility: keep focus behavior but do not activate navigation
		card.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				// Do not open card link; RSVP is handled separately
			}
		});

	// pointerdown/up to detect drags
	card.addEventListener('pointerdown', (ev) => {
		pointerDownPos = { x: ev.pageX, y: ev.pageY };
	});

	// Attach RSVP click handler to footer element (not the cards)
	const rsvpElClickable = document.getElementById('rsvp-count');
	if (rsvpElClickable) {
		// Determine RSVP URL from cards (prefer data-link that contains 'aces-rsvp')
		function findRsvpLink() {
			const candidate = cards
				.map(c => c.getAttribute('data-link'))
				.find(h => typeof h === 'string' && h.includes('aces-rsvp'));
			return candidate || 'https://forms.hackclub.com/aces-rsvp';
		}

		function openRsvp() {
			const url = findRsvpLink();
			window.location.href = url;
		}

		rsvpElClickable.style.cursor = 'pointer';
		rsvpElClickable.tabIndex = 0; // make focusable for keyboard
		rsvpElClickable.addEventListener('click', (ev) => {
			if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
			openRsvp();
		});

		rsvpElClickable.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				openRsvp();
			}
		});
	}
	card.addEventListener('pointerup', () => { pointerDownPos = null; });
	card.addEventListener('pointercancel', () => { pointerDownPos = null; });

	// Prevent text selection drag from selecting inner text while interacting
	card.addEventListener('dragstart', (ev) => ev.preventDefault());
});
// });
