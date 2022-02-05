import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

@Entity("bookings")
export class BookingEntity extends BaseEntity {
	@PrimaryColumn("text")
	id: string;

	@Column("text")
	listing: string;

	@Column("text")
	tenant: string;

	@Column("text")
	checkIn: string;

	@Column("text")
	checkOut: string;
}
