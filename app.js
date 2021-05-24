const express = require("express");
const {ServiceBusClient} = require("@azure/service-bus");

const app = express();

app.use(express.urlencoded({
    extended: true
  }));

app.set('view engine', 'ejs');

const port = process.env.PORT || 80

const connStr = 'Endpoint=sb://service-bus-tezt-ucu.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=O6g9uHAbA7gpLZMUqFnsn841gZMp/fgb8/L29TSGgGA='
const qName = 'ucu-queue'

var msgs = []

app.get("/", (request, response) => {
    response.render('index.ejs', {msgs: msgs});
});

// sender
app.post('/form', async (req, res) => {
    const reqMsg = req.body.msg;
    const sbClient = new ServiceBusClient(connStr);
    const sender = sbClient.createSender(qName);
    const serviceBusMsg = {
        body: reqMsg
    }
    await sender.sendMessages(serviceBusMsg);

    res.redirect('/');
  })

// receiver
async function main(){
    const sbClient = new ServiceBusClient(connStr);
    const receiver = sbClient.createReceiver(qName);

    const msgHandler = async (msg) => {
        console.log(msg.body);
        msgs.push(msg.body);
    }

    const errHandler = async (err) => {
        console.log(err);
    }

    receiver.subscribe({
        processMessage: msgHandler,
        processError: errHandler
    });
}

main().catch((err) => {
    console.log("Error: ", err);
    process.exit(1);
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


