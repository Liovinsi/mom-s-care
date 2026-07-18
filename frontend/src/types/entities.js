/**
 * @typedef {"guest" | "warden" | "super_admin"} UserRole
 */

/**
 * @typedef {"google" | "facebook" | "local"} AuthProvider
 */

/**
 * @typedef {"available" | "held" | "booked" | "occupied" | "maintenance"} BedStatus
 */

/**
 * @typedef {"pending" | "approved" | "rejected" | "checked_in"} BookingStatus
 */

/**
 * @typedef {"pending" | "paid" | "failed" | "refunded"} PaymentStatus
 */

/**
 * @typedef {"upi" | "card" | "cash" | "bank_transfer" | "mock"} PaymentMethod
 */

/**
 * @typedef {"open" | "in_progress" | "resolved" | "closed"} ComplaintStatus
 */

/**
 * @typedef {Object} Branch
 * @property {string} branch_id
 * @property {string} name
 * @property {string} code
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} description
 * @property {string[]} amenities
 * @property {string[]} images
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} Room
 * @property {string} room_id
 * @property {string} branch_id
 * @property {string} name
 * @property {string} floor
 * @property {"ac" | "non_ac"} ac_type
 * @property {number} sharing_type
 * @property {number} monthly_rent
 * @property {number} deposit_amount
 * @property {number} token_amount
 * @property {string[]} amenities
 * @property {string[]} images
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} Bed
 * @property {string} bed_id
 * @property {string} branch_id
 * @property {string} room_id
 * @property {string} label
 * @property {{row: number, col: number}} position
 * @property {BedStatus} status
 * @property {string | null} current_guest_id
 * @property {string | null} hold_id
 * @property {string | null} hold_expires_at
 */

/**
 * @typedef {Object} Guest
 * @property {string} guest_id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {AuthProvider} provider
 * @property {string} avatar_url
 */

/**
 * @typedef {Object} StaffUser
 * @property {string} staff_user_id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string | null} branch_id
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} Booking
 * @property {string} booking_id
 * @property {string} guest_id
 * @property {string} branch_id
 * @property {string} room_id
 * @property {string} bed_id
 * @property {string} move_in_date
 * @property {BookingStatus} status
 * @property {number} monthly_rent
 * @property {number} deposit_amount
 * @property {number} token_amount
 * @property {string[]} document_filenames
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Payment
 * @property {string} payment_id
 * @property {string} booking_id
 * @property {string} guest_id
 * @property {string} branch_id
 * @property {number} amount
 * @property {PaymentMethod} method
 * @property {PaymentStatus} status
 * @property {string} reference
 * @property {string | null} paid_at
 */

/**
 * @typedef {Object} Complaint
 * @property {string} complaint_id
 * @property {string} guest_id
 * @property {string} branch_id
 * @property {string | null} room_id
 * @property {string | null} bed_id
 * @property {string} title
 * @property {string} description
 * @property {ComplaintStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 */

export {};
