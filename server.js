require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const verifyJTW = require('./middleware/verifyJTW');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB =  require('./config/dbConn');
const PORT = process.env.PORT || 3300;

// connect to MongoDb
connectDB();
// custom middleware logger
app.use(logger); 

//Handle options credentials check before CORS!
////and fetch cookies credentials requirement
app.use(credentials)

// Cross Origin Resourse Sharing
app.use(cors(corsOptions));

//built-in middleware for handling urlencoded form data
app.use(express.urlencoded({extended: false}));

// buils-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// serve static files
app.use(express.static(path.join(__dirname, '/public')))

//routes 
app.use('/', require('./routes/api/root'));
app.use('/register', require('./routes/api/register'));
app.use('/auth', require('./routes/api/auth'));
app.use('/refresh', require('./routes/api/refresh'));
app.use('/logout', require('./routes/api/logout'));
app.use(verifyJTW);
app.use('/employees', require('./routes/api/employees'));

app.all('/*', (req, res) =>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if(req.accepts('json')){
        res.json({error : '404 Not Found'});
    } else{
        res.type('txt').send('404.html');  
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDb');
    app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})
})
