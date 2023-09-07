const database = require("../database/db");
const joinUserEvent =  (req, res) => {
    const { id, event_id } = req.body;
  
    // Check if the user has already booked the same event
    const checkUserBookedQuery = "SELECT join_status FROM user_event_join WHERE id = ? AND event_id = ?";
        
    database.query(checkUserBookedQuery, [id, event_id], (err, userBookedEvent) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Server Error' });
      }
  
      if (userBookedEvent.length > 0) {
        return res.status(400).json({ error: 'User already booked this event' });
      }
  
      // Query the database to fetch event start_time and end_time based on event_id
      const fetchEventTimesQuery = "SELECT start_time, end_time FROM events WHERE event_id = ?";
  
      database.query(fetchEventTimesQuery, [event_id], (err, eventTimes) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Server Error' });
        }
  
        // Check if eventTimes contains valid data
        if (eventTimes.length !== 1 || !eventTimes[0].start_time || !eventTimes[0].end_time) {
          return res.status(400).json({ error: 'Invalid Event Data' });
        }
  
        // Get the current time
        const now = new Date();
        const startTime = new Date(eventTimes[0].start_time);
        const endTime = new Date(eventTimes[0].end_time);
 
        // Check for overlapping events
        const checkOverlapQuery = `
          SELECT uej.join_status
          FROM user_event_join uej
          JOIN events e ON uej.event_id = e.event_id
          WHERE uej.id = ? 
            AND (
              (e.start_time BETWEEN ? AND ?)
              OR (e.end_time BETWEEN ? AND ?)
            )
        `;
  
        database.query(checkOverlapQuery, [id, startTime, endTime, startTime, endTime], (err, overlappingEvents) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Server Error' });
          }
  
          // Check if there are overlapping events
          if (overlappingEvents.length > 0) {
            return res.status(400).json({ error: 'Overlap' });
          }
  
          // Insert the user-event relationship with join_status into user_event_join table
          const insertJoinQuery = "INSERT INTO user_event_join(id, event_id, join_status) VALUES (?, ?, ?)";
  
          database.query(insertJoinQuery, [id, event_id, 'Joined'], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Server Error' });
            }
  
            return res.status(201).json({ message: 'User joined event!' });
          });
        });
      });
    });
  };
  module.exports={joinUserEvent};