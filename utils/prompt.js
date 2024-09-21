const initializeForm = (shadowRoot) => {
	// Select buttons within the shadow root
	const buttons = shadowRoot.querySelectorAll('.button-30');
	console.log("Buttons found: ", buttons);

	buttons.forEach(button => {
		if (!button.classList.contains('submit')) {
			button.addEventListener('click', (event) => {
				// Prevent default button behavior
				event.preventDefault();
				console.log("Button clicked: ", button);

				// Remove 'selected' class from all buttons
				buttons.forEach(btn => {
					btn.classList.remove('selected');
				});

				// Add 'selected' class to the clicked button
				button.classList.add('selected');
			});
		}
	});

	// Form validation and submission
	const form = shadowRoot.querySelector('.configForm');

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		// Form validation
		let isFormValid = true;

		// If time limit is not a number or empty
		const timeLimit = shadowRoot.querySelector('#limit').value;
		console.log("Time limit: ", timeLimit);

		// prevent string , not null and value greater that 120min 
		if (isNaN(timeLimit) || timeLimit.length <= 0 || timeLimit > 120 ) {
			isFormValid = false;
			alert('Please Enter a valid number for Time Limit[ < 120 ]!');
		}

		// If no button is selected
		if (!shadowRoot.contains(shadowRoot.querySelector('.selected'))) {
			isFormValid = false;
			alert('Please select a button!');
		}

		// If all form input is valid
		if (isFormValid) {
			const useTime = shadowRoot.querySelector('.button-30.selected').value;
			console.log("Use time: ", useTime);

			const data = {
				expireOn: Date.now() + parseInt(useTime) * 60 * 1000, // Convert minutes into milliseconds
				dailyLimit: parseInt(timeLimit)
			};
			console.log(data);
			// Send data to foreground.js
			window.parent.postMessage({ type: 'FORM_DATA', data: data }, '*');
		}
	});


	//whitelist website
	const whiteListBtn = shadowRoot.getElementById("whitelist");

	whiteListBtn.addEventListener('click',(event) => {
		event.preventDefault();

		// Send data to foreground.js
		window.parent.postMessage({ type: 'FORM_DATA', data: null }, '*');
	})
}

// Wait for the shadow root to be available
const waitForShadowRoot = () => {
	const shadowHost = document.querySelector("#overlay");
	if (shadowHost) {
		console.log("Shadow Host found");
		const shadowRoot = shadowHost.shadowRoot;
		initializeForm(shadowRoot);
	} else {
		console.log("Waiting for shadow root...");
		setTimeout(waitForShadowRoot, 100); // Retry after 100ms
	}
};

waitForShadowRoot();


// Make the function accessible in the global scope
// window.initPromptForm = initPromptForm;
// console.log('initPromptForm has been assigned to the global scope');

// document.addEventListener('DOMContentLoaded', () => {
// 	console.log("Script loaded");

// 	// Get the shadow root
// 	const shadowRoot = document.currentScript.getRootNode();

// 	// Select buttons within the shadow root
// 	const buttons = shadowRoot.querySelectorAll('.radio-btn');
// 	console.log("Buttons found: ", buttons);

// 	buttons.forEach(button => {
// 		if (!button.classList.contains('submit')) {
// 			button.addEventListener('click', (event) => {
// 				// Prevent default button behavior
// 				event.preventDefault();
// 				console.log("Button clicked: ", button);

// 				// Remove 'selected' class from all buttons
// 				buttons.forEach(btn => {
// 					btn.classList.remove('selected');
// 				});

// 				// Add 'selected' class to the clicked button
// 				button.classList.add('selected');
// 			});
// 		}
// 	});

// 	// Form validation and submission
// 	const form = shadowRoot.querySelector('.configForm');

// 	form.addEventListener('submit', (event) => {
// 		event.preventDefault();

// 		// Form validation
// 		let isFormValid = true;

// 		// If time limit is not a number or empty
// 		const timeLimit = shadowRoot.querySelector('#limit').value;
// 		console.log("Time limit: ", timeLimit);

// 		if (isNaN(timeLimit) || timeLimit.length <= 0) {
// 			isFormValid = false;
// 			alert('Please Enter a valid number for Time Limit!');
// 		}

// 		// If no button is selected
// 		if (!shadowRoot.contains(shadowRoot.querySelector('.selected'))) {
// 			isFormValid = false;
// 			alert('Please select a button!');
// 		}

// 		// If all form input is valid
// 		if (isFormValid) {
// 			const useTime = shadowRoot.querySelector('.radio-btn.selected').value;
// 			console.log("Use time: ", useTime);

// 			const data = {
// 				expireOn: Date.now() + parseInt(useTime) * 60 * 1000, // Convert minutes into milliseconds
// 				dailyLimit: parseInt(timeLimit)
// 			};
// 			console.log(data);
// 			// Send data to foreground.js
// 			window.parent.postMessage({ type: 'FORM_DATA', data: data }, '*');
// 		}
// 	});
// });