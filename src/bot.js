import { replyMessage, replyButton, sendMessage } from './facebook.js'
import config from './../config.js'
import { Client } from 'recastai'

const client = new Client(config.recastToken, config.language)
function iconToUrl(icon)
{
	switch(icon) {
		case 'clear-day':
			return 'http://imgur.com/jWA7450.png'
		case 'clear-night':
			return 'http://imgur.com/YVSD9te.png'
		case 'cloudy':
			return 'http://imgur.com/JHBvvhK.png'
		case 'fog':
			return 'http://imgur.com/KTURmRU.png'
		case 'partly-cloudy-day':
			return 'http://imgur.com/uYofr40.png'
		case 'partly-cloudy-night':
			return 'http://imgur.com/O5ya7FI.png'
		case 'rain':
			return 'http://imgur.com/j2mlRwf.png'
		case 'sleet':
			return 'http://imgur.com/cBK8TMe.png'
		case 'snow':
			return 'http://imgur.com/R3mPwS3.png'
		case 'wind':
			return 'http://imgur.com/7iVilv6.png'
		default :
			return 'http://imgur.com/iA40tSf.png'
	}

}
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
          buttonTitle: 'My first button',    /* Option of your button. */
          buttonUrl: 'https://recast.ai/',   /* If you like more option check out ./facebook.js the function replyButton, and look up */
          buttonType: 'web_url',             /* the facebook doc for button https://developers.facebook.com/docs/messenger-platform/send-api-reference#message */
          elementsTitle: 'I don\'t get it :(',
        }
        replyButton(senderID, options)        /* to reply a button */
      } else {
		var trigger=true
		//Weather request
        if (action && action.done && action.slug=='yes') {
			trigger=false
			var loc = res.getMemory('location')
			var time = res.getMemory('time')
			//Dark Sky API
			const DarkSky = require('dark-sky')
			const forecast = new DarkSky(config.darsky)
			//Options setup
			forecast.latitude(loc.lat)           
			forecast.longitude(loc.lng)         
			forecast.time(time.iso)            
			forecast.units('ca')                   
			forecast.language('en')                 
			forecast.exclude('minutely,daily,hourly')              
			var result = forecast.get().then(res => {                 
			
			//console.log(res)
			var button = {
				recipient: {
					id: senderID,
				},
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'list',
							elements: [
								{
									title: loc.raw + " on " + time.formatted,
									subtitle:'Powered by Dark Sky',
									image_url:'http://i.imgur.com/IvX5Qvj.png'
								},
								{
									title:'Weather',
									image_url:iconToUrl(res.currently.icon),
									subtitle:res.currently.summary
								},
								{
									title:'Temperature',
									image_url: 'http://i.imgur.com/eg8YRXR.png',
									subtitle:res.currently.temperature+'°C'
								},
								{
									title:'Humidity',
									image_url: 'http://i.imgur.com/0SYYUtL.png',
									subtitle:res.currently.humidity*100+'%'
								}				
							],
						},
					},
				},
			}
			//Send the message
			let promise = Promise.resolve()
			sendMessage(button)
			promise.then(() => {
				console.log('Reply using Weather API sent')
			}).catch(err => {
			console.log(err)
			})
		})
		.catch(err => {
		//Case for Forecast 400 Bad Request
		
        console.log(err)
		if(err=="Forecast cannot be retrieved. Response: 400 Bad Request")
		{
			var reply="Sorry but I can\'t get the weather for this request."
			let promise = Promise.resolve()
			replyMessage(senderID,reply)
			promise.then(() => {
			}).catch(err => {
			console.log(err)
			})
		}
		})
        }
		//Reply using Recast API
		if(trigger)
		{
			let promise = Promise.resolve()
			replies.forEach(rep => {
			promise = promise.then(() => replyMessage(senderID,rep))
			})
			promise.then(() => {
				console.log('Reply using Recast sent')
			}).catch(err => {
			console.log(err)
			})
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
