const express = require('express');
const cors = require('cors');
const path = require('path');
// utils
const {readXMLFile} = require('./utils/xmlUtils');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
// Database set up
const mongoose = require('mongoose');
const db = require('./config/database');

const app = express();
const PORT = 3000;
const LOCATION_LIMIT = 10;

const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');
const user = require('./middlewares/user');
const protected = require('./middlewares/protectedRoutes');

app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded reques
// Serve static files from the React app in the 'dist' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.use((req, res, next) => {
    // res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
  });
  
db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', async () => {
    console.log('Connection is open...');

    // Use the models
    const User = require('./models/User');
    const Location = require('./models/Location');
    const Event = require('./models/Event');

    // Initialize Database - Load Location and Event Data from datasets into Database if the Database is empty
    Location.find({})
    .then((data) => {
        if (data.length === 0) {
            readXMLFile('../datasets/venues.xml')
            .then(async (LocationData) => {
                // Load venue data first, choosing only 10 of them
                const LocationList = []
                let i = 0;
                while (LocationList.length < LOCATION_LIMIT) {
                    if (parseFloat(LocationData.venues.venue[i].latitude) && LocationList.includes) {
                        LocationList.push(LocationData.venues.venue[i]);
                    };
                    i += 5;
                }
                // Save into database
                LocationList.forEach(location => {
                    let newLocation = new Location({
                        locId: parseInt(location.$.id),
                        name: location.venuee[0],
                        lat: parseFloat(location.latitude),
                        long: parseFloat(location.longitude)
                    })
                    newLocation.save()
                    .then(() => {
                        console.log('New location created successfully');
                    })
                    .catch((err) => {
                        console.log('Failed to create a new location');
                        console.log(err);
                    });
                });
                // Load event data of the 10 venues chosen
                readXMLFile('../datasets/events.xml')
                .then((EventData) => {
                    const filteredEventList = LocationList.flatMap(location => {
                        const locId = location.$.id;
                        const venue = location.venuee[0];
                        return EventData.events.event
                            .filter(event => parseInt(event.venueid) === parseInt(locId))
                            .map(event => ({
                                eventId: parseInt(event.$.id),
                                title: event.titlee[0],
                                datetime: event.predateE[0],
                                presenter: event.presenterorge[0],
                                description: event.desce[0],
                                venue: venue,
                                locId: parseInt(locId)
                            }))
                    })
                    // Save into database
                    filteredEventList.forEach((event) => {
                        let newEvent = new Event({
                            eventId: event.eventId,
                            title: event.title,
                            datetime: event.datetime,
                            presenter: event.presenter,
                            description: event.description,
                            venue: event.venue,
                            locId: event.locId
                        })
                        newEvent.save()
                        .then(() => {
                            console.log('New event created successfully');
                        })
                        .catch((err) => {
                            console.log('Failed to create a new event');
                            console.log(err);
                        });
                    })
                })
                .catch((err) => {
                    console.log('Error reading data from xml file:');
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log('Error reading data from xml file:');
                console.log(err);
            })
        }
    })
    .catch((err) => {
        console.log('Failed to read from Location');
        console.log(err);
    })
    
    //Load number of events to each locations
    const missingNumEvents = await Location.find({ numEvents: { $exists: false } });
    if (missingNumEvents.length > 0) {
        const eventCounts = await Event.aggregate([
        {
            $group: {
            _id: '$locId', // Group by locId
            count: { $sum: 1 }, // Count events per location
            },
        },
        ]);

        for (const { _id, count } of eventCounts) {
        await Location.findOneAndUpdate(
            { locId: _id },
            { numEvents: count }, 
            { new: true }
        );
        console.log(`Updated numEvents for Location ${_id}: ${count}`);
        }
    } else {
        console.log('All locations already have numEvents initialized');
    }
    // Initialize admin account
    User.find({admin: true})
    .then(async (user) => {
       if (user.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const newAdmin = new User({
            username: 'admin',
            email: 'admin@email.com',
            password: hashedPassword,
            admin: true
        })
        newAdmin.save()
        .then((data) => {
            console.log('Admin account created successfully');
            console.log(data);
        })
        .catch((err) => {
            console.log('Failed to create Admin User');
            console.log(err);
        })
       }
    })
    .catch((err) => {
        console.log('Failed to read from User');
        console.log(err);
    })

    app.use('/api/auth', auth);
    app.use('/api/admin', admin);
    app.use('/api/user', user);
    app.use('/protected', protected);

    // app.post('/test', (req, res) => {
    //     try{
    //         console.log("post request got!");
    //         res.status(200).send('Hell0');
    //     }catch(error){
    //         res.status(404).send(error);
    //     }
    // });
})


const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});