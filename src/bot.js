import { replyMessage, replyButton } from './facebook.js'
import config from './../config.js'
import { Client } from 'recastai'

const client = new Client(config.recastToken, config.language)

function handleMessage(event) {
  const senderID = event.sender.id
  const messageText = event.message.text
  const messageAttachments = event.message.attachments
  if (messageText) {
    client.textConverse(messageText, { conversationToken: senderID }).then((res) => {
      const reply = res.reply()               /* To get the first reply of your bot. */
      const replies = res.replies             /* An array of all your replies */
      const action = res.action               /* Get the object action. You can use 'action.done' to trigger a specification action when it's at true. */

      if (!reply) {
        const options = {
          messageText: null,
          buttonTitle: 'Error',    /* Option of your button. */
          buttonUrl: 'https://recast.ai/',   /* If you like more option check out ./facebook.js the function replyButton, and look up */
          buttonType: 'web_url',             /* the facebook doc for button https://developers.facebook.com/docs/messenger-platform/send-api-reference#message */
          elementsTitle: 'I don\'t get it :(',
        }
        replyButton(senderID, options)        /* to reply a button */
      } else {
	  if (action && action.done && action.slug=='yes') {
	
		var loc = res.getMemory('location')
		var time = res.getMemory('time')
		//Dark Sky API
		const DarkSky = require('dark-sky')
		const forecast = new DarkSky('496eb996e9fc9aacdc560cd0ed06c347')
		//Options setup
		forecast.latitude(loc.lat)           
		forecast.longitude(loc.lng)         
		forecast.time(time.iso)            
		forecast.units('ca')                   
		forecast.language('en')                 
		forecast.exclude('minutely,daily,hourly')              
		var result = forecast.get().then(res => {                 
			var val = res.currently
			console.log(res)
			var reply = "Region : " + res.timezone + "\nWeather : " + val.summary + "\nTemperature : " + val.temperature + "°C\nHumidity : " + val.humidity*100 +"%" + "\n Powered by Dark Sky"
			rtm.sendMessage(reply, dm)
		})
		.catch(err => {
        console.log(err)
		})
		let promise = Promise.resolve()
        replies.forEach(rep => {
          promise = promise.then(() => replyMessage(senderID,rep))
        })
        promise.then(() => {
          console.log('ok')
        }).catch(err => {
          console.log(err)
        })
    // Do something if you need: use res.memory('notion') if you got a notion from this action
    }
      }
    }).catch(err => {
      console.log(err)
    })
  } else if (messageAttachments) {
    replyMessage(senderID, 'Message with attachment received')
  }
}
module.exports = {
  handleMessage,
}
