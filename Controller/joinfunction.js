const database = require("../database/db");




const joinUserEvent = (req, res) => {
  const { id, event_id } = req.body;

 
  const checkUserBookedQuery = "SELECT join_status FROM user_event_join WHERE id = ? AND event_id = ?";

  database.query(checkUserBookedQuery, [id, event_id], (err, userBookedEvent) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Server Error' });
    }

    if (userBookedEvent.length > 0) {
      return res.status(400).json({ error: 'User already booked this event' });
    }

   
    const fetchEventTimesQuery = "SELECT start_time, end_time FROM events WHERE event_id = ?";

    database.query(fetchEventTimesQuery, [event_id], (err, eventTimes) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Server Error' });
      }

      if (eventTimes.length !== 1 || !eventTimes[0].start_time || !eventTimes[0].end_time) {
        return res.status(400).json({ error: 'Invalid Event Data' });
      }

      const startTime = new Date(eventTimes[0].start_time);
      const endTime = new Date(eventTimes[0].end_time);


    
      const checkOverlapQuery =`
      SELECT uej.id AS user_event_id, uej.event_id, e.start_time, e.end_time
      FROM user_event_join AS uej
      JOIN events AS e ON uej.event_id = e.event_id
      WHERE uej.id = ?
      AND (
        (e.start_time <= ? AND e.end_time >= ?)  
        OR
        (e.start_time >= ? AND e.start_time <= ?)
        OR
        (e.end_time >= ? AND e.end_time <= ?)    
      )
      ` ;
      const queryParams = [id, startTime, endTime, startTime, endTime, startTime, endTime];

   
      database.query(checkOverlapQuery, queryParams, (err, overlappingEvents) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Server Error' });
        }

        if (overlappingEvents.length > 0) {
          return res.status(400).json({ error: 'Overlap' });
        }

      
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

module.exports = { joinUserEvent };

