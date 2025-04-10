// Type definitions
interface Level10 {
	finalValue: string
	metadata: {
		createdAt: Date
		importance: number
	}
}

interface Level9 {
	description: string
	active: boolean
	configuration: Level10
	metrics: Array<{
		name: string
		value: number
	}>
}

interface Level8 {
	id: string
	settings: {
		enabled: boolean
		threshold: number
	}
	subComponent: Level9
	tags: string[]
}

interface Level7 {
	name: string
	version: string
	features: {
		advanced: boolean
		experimental: boolean
	}
	component: Level8
	supportedPlatforms: string[]
}

interface Level6 {
	category: string
	priority: number
	details: {
		created: Date
		lastModified: Date
	}
	module: Level7
	dependencies: string[]
}

interface Level5 {
	title: string
	status: "active" | "inactive" | "deprecated"
	metrics: {
		performance: number
		reliability: number
		usability: number
	}
	service: Level6
	relatedItems: Array<{
		id: string
		relevance: number
	}>
}

interface Level4 {
	code: string
	isPublic: boolean
	configuration: {
		timeout: number
		retries: number
		caching: boolean
	}
	api: Level5
	permissions: Array<{
		role: string
		access: "read" | "write" | "admin"
	}>
}

interface Level3 {
	id: string
	type: string
	metadata: {
		owner: string
		createdDate: Date
		version: string
	}
	resource: Level4
	tags: Record<string, string>
}

interface Level2 {
	name: string
	enabled: boolean
	settings: {
		mode: "development" | "production" | "testing"
		debug: boolean
		logLevel: "info" | "warn" | "error" | "debug"
	}
	component: Level3
	statistics: {
		requestCount: number
		errorRate: number
		averageResponseTime: number
	}
}

interface Level1 {
	id: string
	name: string
	description: string
	configuration: {
		version: string
		environment: string
		features: string[]
	}
	system: Level2
	users: Array<{
		id: string
		username: string
		role: string
		active: boolean
	}>
}

// The actual 10-level nested object
const complexNestedObject: Level1 = {
	id: "sys-12345",
	name: "Enterprise System",
	description: "Main enterprise application system with multiple subsystems",
	configuration: {
		version: "3.5.2",
		environment: "production",
		features: ["authentication", "authorization", "monitoring", "reporting"],
	},
	system: {
		name: "CoreSystem",
		enabled: true,
		settings: {
			mode: "production",
			debug: false,
			logLevel: "warn",
		},
		component: {
			id: "comp-auth-001",
			type: "authentication",
			metadata: {
				owner: "Security Team",
				createdDate: new Date("2024-01-15"),
				version: "2.1.0",
			},
			resource: {
				code: "AUTH-SERVICE",
				isPublic: false,
				configuration: {
					timeout: 30000,
					retries: 3,
					caching: true,
				},
				api: {
					title: "Authentication API",
					status: "active",
					metrics: {
						performance: 98.5,
						reliability: 99.9,
						usability: 95.0,
					},
					service: {
						category: "security",
						priority: 1,
						details: {
							created: new Date("2023-05-10"),
							lastModified: new Date("2024-02-28"),
						},
						module: {
							name: "TokenManager",
							version: "1.3.4",
							features: {
								advanced: true,
								experimental: false,
							},
							component: {
								id: "token-validator",
								settings: {
									enabled: true,
									threshold: 0.85,
								},
								subComponent: {
									description: "JWT validation and verification",
									active: true,
									configuration: {
										finalValue: "HS256-encrypted-signature",
										metadata: {
											createdAt: new Date("2023-11-12"),
											importance: 9.8,
										},
									},
									metrics: [
										{ name: "validationSpeed", value: 0.0023 },
										{ name: "errorRate", value: 0.0001 },
										{ name: "hitRatio", value: 0.9987 },
									],
								},
								tags: ["security", "token", "jwt", "validation"],
							},
							supportedPlatforms: ["web", "mobile", "desktop", "api"],
						},
						dependencies: [
							"crypto-lib",
							"logger",
							"user-store",
							"rate-limiter",
						],
					},
					relatedItems: [
						{ id: "user-management", relevance: 0.95 },
						{ id: "permission-system", relevance: 0.88 },
						{ id: "audit-log", relevance: 0.75 },
					],
				},
				permissions: [
					{ role: "admin", access: "admin" },
					{ role: "security-officer", access: "write" },
					{ role: "developer", access: "read" },
				],
			},
			tags: {
				department: "security",
				criticality: "high",
				compliance: "SOC2,GDPR,HIPAA",
				review: "quarterly",
			},
		},
		statistics: {
			requestCount: 15789032,
			errorRate: 0.0012,
			averageResponseTime: 48.3,
		},
	},
	users: [
		{
			id: "usr-admin-001",
			username: "admin",
			role: "system-administrator",
			active: true,
		},
		{
			id: "usr-dev-042",
			username: "jsmith",
			role: "developer",
			active: true,
		},
		{
			id: "usr-sec-007",
			username: "security-team",
			role: "security-officer",
			active: true,
		},
	],
}

// To access the deepest nested value:
const deepestValue =
	complexNestedObject.system.component.resource.api.service.module.component
		.subComponent.configuration.finalValue

console.log("Deepest nested value:", deepestValue)

// Export for use elsewhere
export default complexNestedObject
