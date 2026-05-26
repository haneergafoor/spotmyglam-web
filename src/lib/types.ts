export type UserRole = "CUSTOMER" | "SALON_OWNER" | "ADMIN";

export type User = {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

export type Salon = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  categories: string[];
  gallery: string[];
  offers: string[];
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: string;
  salonId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "PARTIAL_REFUND"
  | "CANCELLED";

export type Booking = {
  id: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  userId: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
};

export type OtpSession = {
  phoneNumber: string;
  code: string;
  expiresAt: string;
  attempts: number;
  role: UserRole;
  createdAt: string;
};

export type Store = {
  users: User[];
  salons: Salon[];
  services: Service[];
  bookings: Booking[];
  payments: Payment[];
  otpSessions: OtpSession[];
};
