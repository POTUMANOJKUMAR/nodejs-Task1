const database = require("../database/db");
const eventCreate =  (req, res) => {
    const event_name = req.body.event_name;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    const query =
      "insert into events(event_name,start_time,end_time) values(?,?,?)";
    database.query(query, [event_name, start_time, end_time], (err, result) => {
      if (err) {
        console.log(err);
        res.send({ message: "Server Error", err });
      } else return res.send("event created!");
    });
  };
  const Ongoing =  (req, res) => {
    // Get the current time
    const currentTime = new Date();
  
    // Fetch participants and their associated event names for ongoing events
    const query = `
      SELECT u.username AS participant_name, e.event_name AS event_name
      FROM user_event_join p
      JOIN users u ON p.id = u.id
      JOIN events e ON p.event_id = e.event_id
      WHERE e.start_time <= ? AND e.end_time >= ?;
    `;
  
    database.query(query, [currentTime, currentTime], (err, results) => {
      if (err) {
        console.error('Error fetching ongoing participants:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      res.status(200).json(results);
    });
  };
  module.exports={eventCreate,Ongoing};