var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var morgan = require("morgan");
var mongoose = require("mongoose");
var Fawn = require("fawn");
var config = require("./config");

var MEANdata = require("./server/route/MEANdata");
var commentRoute = require("./server/route/commentRoute");
var notificationRoute = require("./server/route/notificationRoute");
var userRoute = require("./server/route/userRoute");

var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

var port = process.env.PORT || 3000;

mongoose.connect(config.url, (err, db)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Successfully Connected to Database : " + config.db);
    }
});

Fawn.init(mongoose);

app.use(morgan("dev"));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.static(path.join(__dirname, "dist/Angular2Authentication")));  

app.use("/data", MEANdata);
app.use("/posts", commentRoute);
app.use('/notification', notificationRoute);
app.use("/api", userRoute);

app.use('*', (req, res)=> {
    res.sendFile(path.join(__dirname, "dist/Angular2Authentication/index.html"));
});

/* io.sockets.on('connection', (socket) => {
    console.log('connected : ' + Object.keys(socket));
    socket.emit('onConnected', socket.id);

    socket.on('join', (data)=>{
        socket.join(data.username)
    })

    socket.on('Msg', (data)=>{
       console.log(Object.keys(io.sockets.adapter.rooms))
        io.in(data.to).emit('newMsg', {from : data.from, Msg : data.Msg})
    })
}) */

server.listen(port, ()=> {
    console.log('App Listenting On Port ' + port);
});
