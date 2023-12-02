export const isValidEmail = (email: string) => {
	// Perform email validation logic here
	// Return true if email is valid, false otherwise
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string) => {
	// Perform phone number validation logic here
	// Return true if phone number is valid, false otherwise
	return /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
};
