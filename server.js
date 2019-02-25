    const express = require('express')
    const bodyParser = require('body-parser')
    const Pusher = require('pusher')
    const cors = require('cors')
    require('dotenv').config()
    const shortId = require('shortid') 
    const dialogFlow = require('./dialogFlow')

    const app = express()
    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      encrypted: true
    })

    app.post('/message', async (req, res) => {
      const chat = {
        ...req.body,
        id: shortId.generate(),
        createdAt: new Date().toISOString()
      } 

      pusher.trigger('my-channel', 'my-event', chat);

      const message = chat.message;
      const response = await dialogFlow.send(message);

      pusher.trigger('my-channel', 'my-event', {
        message: `${response.data.result.fulfillment.speech}`,
        type : 'bot',
        createdAt : new Date().toISOString(),
        id: shortId.generate()
      })
      
      res.send(chat)
    })

    app.listen(process.env.PORT || 5000, () => console.log('Listening at 5000'))