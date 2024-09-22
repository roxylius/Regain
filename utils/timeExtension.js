const initializeForm = async (shadowRoot) => {
	// Select buttons within the shadow root
	const buttons = shadowRoot.querySelectorAll('.button-30');
	console.log("Buttons found: ", buttons);

	//find page config to disable btn with time < remaining time left
	const config = await getConfigData();

	//if no data is received 
	if(config == null){
		alert("There is Error In timeExtension.js Report Dev! https://github.com/roxylius/Regain/issues");
		window.parent.postMessage({ type: 'HIDE_OVERLAY' }, '*');
		return;
	}
	console.log("configTimeExtension.js",config);
	
	buttons.forEach(button => {

		if (!button.classList.contains('submit')) {
			button.addEventListener('click', (event) => {
				// Prevent default button behavior
				event.preventDefault();

				// Remove 'selected' class from all buttons
				buttons.forEach(btn => {
					btn.classList.remove('selected');
				});

				// Add 'selected' class to the clicked button
				button.classList.add('selected');
			});

			//disable btn with less time than remaining
			if (parseInt(button.value) >= (config.dailyLimit - config.timeUsed)){
				button.disabled = true;

				//add lock sign to the disable button
				const lockGifImg = button.querySelector(".lock-gif_001");
				if(lockGifImg){
					lockGifImg.src = "chrome-extension://nldedndhbhcdokondnaamonepdoeinbj/assets/lock.png";
					console.log("lockGifImg.src = ",lockGifImg.src);
					lockGifImg.style.width = "35px";
					lockGifImg.style.height = "35px";
				}
			}
		}
	});

	// Form validation and submission
	const form = shadowRoot.querySelector('.configForm');

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		let isFormValid = true;

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
				allotedTime: parseInt(useTime)
			};
			console.log(data);
			// Send data to foreground.js
			window.parent.postMessage({ type: 'FORM_DATA', data: data }, '*');
		}
	});
}

// Wait for the shadow root to be available
const waitForShadowRoot = () => {
	const shadowHost = document.querySelector("#overlay.overlay-shadowRoot_001");
	if (shadowHost) {
		console.log("Shadow Host found");
		const shadowRoot = shadowHost.shadowRoot;
		initializeForm(shadowRoot);
	} else {
		console.log("Waiting for shadow root...");
		setTimeout(waitForShadowRoot, 100); // Retry after 100ms
	}
};

const getConfigData = async () => {
	// Send a message to request page config
	window.parent.postMessage({ type: 'GET_PAGE_CONFIG' }, '*');

	// Listen for the response
	return new Promise((resolve,reject) => {
		window.addEventListener('message', (event) => {
			if (event.data.type === 'PAGE_CONFIG_RESPONSE') {
				const config = event.data.config;
				resolve(config);
			}
		});
	})
}


waitForShadowRoot();

