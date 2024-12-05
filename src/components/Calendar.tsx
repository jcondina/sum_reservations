"use client";

import { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface Reservation {
	id: string;
	date: string;
	start_time: string;
	end_time: string;
	name: string;
	email: string;
	guests: number;
}

const localizer = momentLocalizer(moment);

export default function Calendar() {
	const [currentDate, setCurrentDate] = useState(moment().toDate());

	const { data: reservations = [] } = useQuery<Reservation[]>({
		queryKey: ["reservations"],
		queryFn: async () => {
			const response = await fetch("/api/reservations");
			const data = await response.json();
			return data;
		},
	});

	// Convert reservations to events format expected by BigCalendar
	const events = reservations.map((reservation) => ({
		id: reservation.id,
		title: `${reservation.name} (${reservation.guests} guests)`,
		start: moment(reservation.start_time).toDate(),
		end: moment(reservation.end_time).toDate(),
		resource: reservation,
	}));

	console.log(events);

	return (
		<div className="h-[600px]">
			<BigCalendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				defaultView="week"
				views={["day", "week"]}
				min={moment().hours(0).minutes(0).seconds(0).toDate()}
				max={moment().hours(23).minutes(59).seconds(59).toDate()}
				date={currentDate}
				onNavigate={(date) => setCurrentDate(date)}
				tooltipAccessor={(event) => {
					const reservation = event.resource as Reservation;
					return `${reservation.name}\n${reservation.email}\n${reservation.guests} guests`;
				}}
				eventPropGetter={() => ({
					className: "bg-blue-500 text-white rounded px-2",
				})}
			/>
		</div>
	);
}
