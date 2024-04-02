/**
 * variables
 */

const chatRoom = document.querySelector('#room_uuid').textContent.replaceAll('"', '')
let chatSocket = null


/**
 *  ELEMENts
 */


const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')



/**
 *  Function
 */
function scrollToBottom(){
  chatLogElement.scrollTop = chatLogElement.scrollHeight
}

function sendMessage() {
    chatSocket.send(
      JSON.stringify({
        type: "message",
        message: chatInputElement.value,
        name: document.querySelector('#user_name').textContent.replaceAll('"', ''),
        agent: document.querySelector('#user_id').textContent.replaceAll('"', ''),
      })
    );
    chatInputElement.value = "";
  }
  
console.log('chatValue :', chatInputElement);
function onChatMessage(data) {
    console.log(data);
  
    if (data.type == "chat_message") {
      let tminfo = document.querySelector(".tmp-info");
  
      if (tminfo) {
        tminfo.remove();
      }
      if (!data.agent) {
        chatLogElement.innerHTML += `
              <div class="flex w-full mt-2 space-x-3 max-w-md">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                  <div>
                          <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                              <p class="text-sm">${data.message}</p> 
                      </div> 
  
                      <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                  </div>
              </div>
              `
      } else {
        chatLogElement.innerHTML += `
          <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
              <div>
                  <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
                      <p class="text-sm">${data.message}</p> 
                  </div> 
                  <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
              </div>
          </div>
          `
      }
    }else if (data.type == "writing_active") {
      if (!data.agent) {
        let tminfo = document.querySelector(".tmp-info");
  
        if (tminfo) {
          tminfo.remove();
        }
        chatLogElement.innerHTML += `
        <div class=" tmp-info flex w-full mt-2 space-x-3 max-w-md">
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
            <div>
                    <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                        <p class="text-sm">The client is typing....</p> 
                </div> 
            </div>
        </div>
        `
      }
    }
    scrollToBottom()
  }

  
/** 
 * Web Socket
 */

chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoom}/`)
chatSocket.onmessage = function(e) {
    onChatMessage(JSON.parse(e.data))
    console.log('Connected to server message')
}

chatSocket.onopen = function(e) {
    console.log('Connected to server Open')
    scrollToBottom()
}

chatSocket.onclose = function(e) {
    console.log('Connected to server close')
}


/**
 * event Listener
 */


chatSubmitElement.onclick = function (e) {
    e.preventDefault();
    sendMessage();
    console.log("done submit");
    return false;
  };
  
chatInputElement.onkeyup = function(e) { 
  if (e.keyCode == 13) {
    sendMessage();
  }
  }


chatInputElement.onfocus = function(e) {
  chatSocket.send(JSON.stringify({
    type: "update",
    message: 'writing_active',
    name: document.querySelector('#user_name').textContent.replaceAll('"', ''),
    agent: document.querySelector('#user_id').textContent.replaceAll('"', ''),
  }))
}