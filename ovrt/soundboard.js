if (!navigator.userAgent.includes("ZFBrowser")) {
	window.SetBrowserTitle = function() {};
	window.SetKeyboardFocus = function() {};
}

function init() {
	if (!window.SetBrowserTitle || !window.SetKeyboardFocus) {
		window.requestAnimationFrame(init);
	} else {
		window.SetBrowserTitle("Soundboard");

		let soundboardData = JSON.parse(localStorage.soundboardData || "{}");
		
		let clip = new Audio();
		clip.addEventListener('canplaythrough', event => {
			clip.volume = volume.value / 100;
			clip.play();
		});
		
		 /***********\
		|	Controls	|
		\***********/
		
		let volume = document.querySelector('#volume');
		volume.addEventListener('input', event => {
			clip.volume = volume.value / 100;
		});

		let editMode = false;
		let editButton = document.querySelector('#edit-button');
		let editBox = document.querySelector('#edit-box');
		editButton.addEventListener('click', event => {
			if (!editMode) { //Clicked edit
				editMode = true;
				window.SetKeyboardFocus(true);
				editButton.innerHTML = "Save";
				editBox.style.visibility = 'visible';

				editBox.value = stringify(soundboardData);				
			} else { //Clicked save
				editMode = false;
				window.SetKeyboardFocus(false);
				editButton.innerHTML = "Edit";
				editBox.style.visibility = 'hidden';

				soundboardData = JSON.parse(editBox.value);
				localStorage.soundboardData = JSON.stringify(soundboardData);
				drawSoundboard();
			}
		});
		
		function stringify(soundboardData) {
			let output = `{`;
			
			for (let [category, sounds] of Object.entries(soundboardData)) {
				output += `\n\t"${category}": [`;
				
				for (let sound of sounds) {
					output += `\n\t\t[`;
					
					for (let property of sound) {
						output += ` "${property}",`
					}
					output = output.replace(/,$/, "");
					
					output += ` ],`;
				}
				output = output.replace(/,$/, "");
				
				output += `\n\t],`;
			}
			output = output.replace(/,$/, "");
			
			output += `\n}\n`;
			return output;
		}
		
		
		
		
		
		 /*********************\
		|	Soundboard Drawing	|
		\*********************/
		
		let soundboard = document.querySelector('#soundboard');
		function drawSoundboard() {
			soundboard.innerHTML = "";
			
			for (let [category, sounds] of Object.entries(soundboardData)) {
				let categoryDiv = document.createElement('div');
				
				let label = document.createElement('label');
				label.htmlFor = category.toLowerCase();
				label.innerHTML = category;
				categoryDiv.appendChild(label);
				
				let checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.checked = true;
				checkbox.classList.add('category-toggle');
				checkbox.id = category.toLowerCase();
				categoryDiv.appendChild(checkbox);
				
				let buttons = document.createElement('div');
				buttons.classList.add('category');
				
				
				
				for (let sound of sounds) {
					let caption = sound[0];
					let url = sound[1];

					if (caption == '\n') { //Newline
						let br = document.createElement('br');
						buttons.appendChild(br);
					} else if (caption == '\t') { //Spacer
						let spacer = document.createElement('div');
						spacer.classList.add('spacer');
						buttons.appendChild(spacer);
					} else { //Regular button
						let button = document.createElement('button');
						button.innerHTML = caption;
						button.classList.add('sound');
						buttons.appendChild(button);

						button.addEventListener('mousedown', event => {
							clip.src = /^https?:\/\//.test(url) ? url : `https://www.myinstants.com/media/sounds/${url}.mp3`;
						});
					}
				}

				categoryDiv.appendChild(buttons);
				soundboard.appendChild(categoryDiv);
			}
		}
		drawSoundboard();
	}
}
init();
