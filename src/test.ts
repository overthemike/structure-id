import { generateStructureId, getStructureInfo, setStructureIdConfig } from "."

setStructureIdConfig({
	newIdOnCollision: true,
})

// Complex JavaScript object for testing
const complexTestObject = {
	id: "usr_48392fc83d92a",
	username: "testuser123",
	email: "test@example.com",
	created: new Date("2023-04-18T14:32:11Z"),
	lastLogin: new Date("2025-03-28T09:12:33Z"),
	status: "active",
	isVerified: true,
	profileVersion: 14,

	personalInfo: {
		firstName: "Test",
		lastName: "User",
		dateOfBirth: new Date("1985-07-12"),
		gender: "non-binary",
		nationality: "Australian",
		languages: ["English", "Spanish", "Mandarin"],
		occupation: "Software Engineer",
		education: [
			{
				institution: "University of Technology",
				degree: "Bachelor of Computer Science",
				graduationYear: 2007,
				gpa: 3.8,
			},
			{
				institution: "Tech Institute",
				degree: "Master of Data Science",
				graduationYear: 2009,
				gpa: 4.0,
				honors: true,
			},
		],
	},

	address: {
		street: "123 Test Street",
		unit: "Apt 456",
		city: "Techville",
		state: "Californium",
		zipCode: "94321",
		country: "Testland",
		coordinates: {
			latitude: 37.7749,
			longitude: -122.4194,
		},
		isVerified: true,
		lastUpdated: new Date("2024-11-15"),
	},

	contactInfo: {
		email: "test@example.com",
		phoneNumber: "+1-555-123-4567",
		alternativeEmails: ["backup@example.com", "work@company.com"],
		emergencyContact: {
			name: "Emergency Person",
			relationship: "Partner",
			phoneNumber: "+1-555-987-6543",
		},
		preferredContactMethod: "email",
	},

	socialMediaProfiles: [
		{
			platform: "Twitter",
			username: "@testuser",
			url: "https://twitter.com/testuser",
			followers: 1256,
			isVerified: true,
			lastPost: {
				content: "Testing a new API!",
				timestamp: new Date("2025-03-25T18:22:01Z"),
				likes: 42,
			},
		},
		{
			platform: "LinkedIn",
			username: "testuser-pro",
			url: "https://linkedin.com/in/testuser-pro",
			followers: 843,
			isVerified: false,
			connections: 512,
		},
		{
			platform: "GitHub",
			username: "testuser-dev",
			url: "https://github.com/testuser-dev",
			followers: 233,
			isVerified: true,
			repositories: 65,
			stars: 1874,
		},
	],

	paymentMethods: [
		{
			id: "pm_visa_21432",
			type: "credit_card",
			isDefault: true,
			lastUsed: new Date("2025-03-15"),
			details: {
				cardType: "Visa",
				lastFourDigits: "4242",
				expiryMonth: 12,
				expiryYear: 2027,
				cardholderName: "Test User",
				billingAddress: {
					street: "123 Test Street",
					city: "Techville",
					state: "Californium",
					zipCode: "94321",
					country: "Testland",
				},
			},
		},
		{
			id: "pm_paypal_19283",
			type: "paypal",
			isDefault: false,
			lastUsed: new Date("2025-01-20"),
			details: {
				email: "test@example.com",
				accountVerified: true,
			},
		},
		{
			id: "pm_crypto_8273",
			type: "crypto",
			isDefault: false,
			details: {
				currency: "Bitcoin",
				walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
				network: "Bitcoin Mainnet",
			},
		},
	],

	transactionHistory: [
		{
			id: "tx_98765432",
			amount: 199.99,
			currency: "USD",
			timestamp: new Date("2025-03-15T13:45:22Z"),
			status: "completed",
			description: "Premium Subscription - Annual",
			paymentMethodId: "pm_visa_21432",
			metadata: {
				subscriptionId: "sub_premium_985",
				promoCode: "YEARLYTEST",
			},
			fees: {
				processingFee: 5.99,
				taxAmount: 16.0,
				discountAmount: 20.0,
			},
		},
		{
			id: "tx_76543219",
			amount: 49.99,
			currency: "USD",
			timestamp: new Date("2025-02-15T09:12:38Z"),
			status: "completed",
			description: "Digital Product Purchase",
			paymentMethodId: "pm_paypal_19283",
			metadata: {
				productId: "prod_ebook_1234",
				category: "educational",
			},
		},
		{
			id: "tx_54321987",
			amount: 9.99,
			currency: "USD",
			timestamp: new Date("2025-01-05T22:17:14Z"),
			status: "refunded",
			description: "In-App Purchase",
			paymentMethodId: "pm_visa_21432",
			metadata: {
				itemId: "virtual_item_4821",
				platform: "ios",
			},
			relatedTransactions: ["tx_refund_54321987"],
		},
	],

	subscriptions: [
		{
			id: "sub_premium_985",
			name: "Premium Plan",
			status: "active",
			startDate: new Date("2025-03-15"),
			endDate: new Date("2026-03-15"),
			renewalDate: new Date("2026-03-15"),
			autoRenew: true,
			price: 199.99,
			billingCycle: "yearly",
			paymentMethodId: "pm_visa_21432",
			features: ["feature1", "feature2", "feature3", "feature4"],
			usage: {
				dataUsed: 248.5,
				dataLimit: 1000,
				apiCallsUsed: 8732,
				apiCallsLimit: 50000,
			},
		},
	],

	preferences: {
		theme: "dark",
		language: "en-US",
		timezone: "America/Los_Angeles",
		currency: "USD",
		notifications: {
			email: {
				marketing: false,
				transactional: true,
				securityAlerts: true,
				newsletter: false,
				frequency: "weekly",
			},
			push: {
				enabled: true,
				marketingOffers: false,
				transactionUpdates: true,
				newFeatures: true,
				accountAlerts: true,
				doNotDisturb: {
					enabled: true,
					startTime: "22:00",
					endTime: "08:00",
				},
			},
		},
		privacy: {
			shareDataWithPartners: false,
			allowLocationTracking: true,
			showProfileToPublic: false,
			saveSearchHistory: true,
			cookiePreferences: {
				necessary: true,
				functional: true,
				performance: true,
				targeting: false,
			},
		},
	},

	security: {
		passwordLastChanged: new Date("2024-12-18"),
		twoFactorEnabled: true,
		twoFactorMethod: "app",
		loginAttempts: [
			{
				timestamp: new Date("2025-03-28T09:12:33Z"),
				ip: "192.168.1.100",
				userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
				location: {
					city: "Techville",
					country: "Testland",
					coordinates: {
						latitude: 37.7749,
						longitude: -122.4194,
					},
				},
				successful: true,
			},
			{
				timestamp: new Date("2025-03-25T15:46:22Z"),
				ip: "10.0.0.123",
				userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)",
				location: {
					city: "San Francisco",
					country: "United States",
					coordinates: {
						latitude: 37.7833,
						longitude: -122.4167,
					},
				},
				successful: false,
				failureReason: "incorrect_password",
			},
		],
		devices: [
			{
				id: "dev_macbook_92834",
				type: "desktop",
				name: "MacBook Pro",
				lastActive: new Date("2025-03-28T09:12:33Z"),
				ipAddress: "192.168.1.100",
				trusted: true,
			},
			{
				id: "dev_iphone_23481",
				type: "mobile",
				name: "iPhone 15",
				lastActive: new Date("2025-03-27T18:22:47Z"),
				ipAddress: "10.0.0.123",
				trusted: true,
			},
		],
		accessTokens: [
			{
				id: "tk_98765",
				name: "Web Session",
				created: new Date("2025-03-28T09:12:33Z"),
				expires: new Date("2025-03-29T09:12:33Z"),
				lastUsed: new Date("2025-03-28T10:15:43Z"),
				scopes: ["read", "write", "profile"],
			},
		],
	},

	analytics: {
		signUpSource: "organic_search",
		averageSessionDuration: 34.7,
		numberOfVisits: 135,
		lastNPSScore: 9,
		featureUsage: {
			dashboard: 87,
			reports: 42,
			settings: 12,
			api: 53,
		},
		recentSearches: [
			"performance metrics",
			"export data",
			"api documentation",
			"billing history",
		],
		abTests: [
			{
				id: "test_new_ui_2025",
				variation: "B",
				enrolled: new Date("2025-02-10"),
			},
			{
				id: "test_pricing_page",
				variation: "A",
				enrolled: new Date("2025-01-05"),
			},
		],
	},

	metadata: {
		version: "3.5.2",
		lastUpdated: new Date("2025-03-28T10:15:43Z"),
		environment: "production",
		tags: ["test", "sample", "complex"],
		debug: {
			createdBy: "system",
			migrationStatus: "complete",
			schemaVersion: 14,
		},
	},
}

const id = generateStructureId(complexTestObject)
console.log(id)
