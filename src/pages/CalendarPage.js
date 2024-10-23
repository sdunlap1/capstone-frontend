import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';

const CalendarPage = () => {
  const { date } = useParams(); // Extract the optional date parameter
  const [initialDate, setInitialDate] = useState(new Date()); // Default to current date
  const navigate = useNavigate();

  useEffect(() => {
    if (date) {
      // Set the initial date to the one provided in the URL
      setInitialDate(new Date(date));
    } else {
      // If no date is provided, use the current date
      setInitialDate(new Date());
    }
  }, [date]);

  return (
    <div>
      <h1>Calendar Page</h1>
      <Calendar 
        initialDate={initialDate} 
        onEventClick={(eventDate) => navigate(`/calendar/${eventDate.toISOString().split('T')[0]}`)}
        onDateClick={(clickedDate) => navigate(`/calendar/${clickedDate}`)}
      />
    </div>
  );
};

export default CalendarPage;
