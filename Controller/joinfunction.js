const database = require("../database/db");




const joinUserEvent = (req, res) => {
  const { id, event_id } = req.body;

  // Query 1: Check if the user has already booked the same event
  const checkUserBookedQuery = "SELECT join_status FROM user_event_join WHERE id = ? AND event_id = ?";

  database.query(checkUserBookedQuery, [id, event_id], (err, userBookedEvent) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Server Error' });
    }

    if (userBookedEvent.length > 0) {
      return res.status(400).json({ error: 'User already booked this event' });
    }

    // Query 2: Check for overlapping events based on start time and end time
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
// console.log(startTime);
// console.log(endTime);

console.log(eventTimes[0].start_time);
console.log(eventTimes[0].end_time);
      // Query 3: Check for overlapping events
      const checkOverlapQuery =`
      SELECT uej.id AS user_event_id, uej.event_id, e.start_time, e.end_time
      FROM user_event_join AS uej
      JOIN events AS e ON uej.event_id = e.event_id
      WHERE uej.id = ?
      AND (
        (e.start_time <= ? AND e.end_time >= ?)   -- Case 1: Event starts before and ends after the new event
        OR
        (e.start_time >= ? AND e.start_time <= ?) -- Case 2: Event starts during the new event
        OR
        (e.end_time >= ? AND e.end_time <= ?)     -- Case 3: Event ends during the new event
      )
      ` ;
      const queryParams = [id, startTime, endTime, startTime, endTime, startTime, endTime];

      // Execute the SQL query
      database.query(checkOverlapQuery, queryParams, (err, overlappingEvents) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Server Error' });
        }

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

module.exports = { joinUserEvent };

