const controller = require('./controller')

module.exports=function(app){
    app.get('/users/:uid',controller.getUsers)
    app.get('/user/:uid',controller.getUser)
    app.post('/user',controller.createUser)

    app.get('/interest',controller.getInterest)

    app.post('/user/interest',controller.createInterest)

    app.post('/events',controller.getEvents)
    app.get('/event/:name',controller.getEvent)
}