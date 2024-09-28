import * as express from 'express';

const app = express();

app.use(express.static('client'));

app.get('/word', (req, res) => {
    res.send({ value: Math.floor(Math.random() * 900 + 100) });
});

app.listen(3000, () => console.log('server started'));