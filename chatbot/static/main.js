/**
 * Returns the current datetime for the message creation.
 */
function getCurrentTimestamp() {
	return new Date();
}

/**
 * Renders a message on the chat screen based on the given arguments.
 * This is called from the `showUserMessage` and `showBotMessage`.
 */
function renderMessageToScreen(args) {
	// local variables
	let displayDate = (args.time || getCurrentTimestamp()).toLocaleString('en-IN', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	});
	let messagesContainer = $('.messages');

	// init element
	let message = $(`
	<li class="message ${args.message_side}">
		<div class="avatar"></div>
		<div class="text_wrapper">
			<div class="text">${args.text}</div>
			<div class="timestamp">${displayDate}</div>
		</div>
	</li>
	`);

	// add to parent
	messagesContainer.append(message);

	// animations
	setTimeout(function () {
		message.addClass('appeared');
	}, 0);
	messagesContainer.animate({ scrollTop: messagesContainer.prop('scrollHeight') }, 300);
}

/**
 * Displays the user message on the chat screen. This is the right side message.
 */
async function showUserMessage(message, datetime) {
	try {
	renderMessageToScreen({
		text: message,
		time: datetime,
		message_side: 'right',
		});
	await $.post('/send_message', {message: message});

	} catch (error) {
	  console.error(error);
	}
  }

async function loadConversation(datetime) {
	$.get('/load_conversation', function(data) {
		console.log(data);
		for (var i = 0 ; i<data.length;i++){
			var message = data[i] ;
			let side = 'left';
			if (message.role=='system') {
				continue
			}
			if (message.role=='user') {
				side='right'
			}
			renderMessageToScreen({
				text: message.content,
				time: datetime,
				message_side: side,
			});
		};
	});
  }
  

/**
 * Displays the chatbot message on the chat screen. This is the left side message.
 */
function showBotMessage(message,datetime) {
	// Load the conversation from Flask
	$.get('/load_last_message', function(data) {
		if (data!=''){
			let message=(data.message);
			renderMessageToScreen({
				text: message,
				time: datetime,
				message_side: 'left',
			});
		};
	});

}

/**
 * Get input from user and show it on screen on button click.
 */
$('#send_button').on('click', async function (e) {
	// get and show message and reset input
	//check if #msg_input.val is not empty
	if($('#msg_input').val() != ""){
		let msg = $('#msg_input').val();
		$('#msg_input').val('');
		await showUserMessage((msg));

		// show bot message
		setTimeout(async function () {
		await showBotMessage();
		}, 1000);
}
});

$('#clear_button').on('click', async function (e) {
	// get and show message and reset input
	//check if #msg_input.val is not empty
	await $.get('/clear_conversation');
	location.reload();
});

/**
 * Returns a random string. Just to specify bot message to the user.
 */


/**
 * Set initial bot message to the screen for the user.
 */
$(window).on('load', function () {
	loadConversation();
});
