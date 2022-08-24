const swaggerAutogen = require('swagger-autogen')();

const doc = {
	info: {
		version: '1.0.0',
		title: 'Quiz App',
		description: 'Documentation of quiz app endpoints'
	},
	host: 'localhost:8000',
	basePath: '/',
	schemes: ['http', 'https'],
	consumes: ['application/json'],
	produces: ['application/json'],
	tags: [
		{
			name: 'Auth',
			description: 'Collection of user based endpoints'
		}
	],
	securityDefinitions: {
		apiKeyAuth: {
			type: 'apiKey',
			in: 'header', // can be "header", "query" or "cookie"
			name: 'authorization', // name of the header, query parameter or cookie
			description: 'any description...'
		}
	},
	definitions: {
		// Auth Related
		Role: {
			'@enum': ['examinee', 'examiner']
		},
		User: {
			name: 'Rahul Kumar',
			email: 'rahuls24@quiz.com',
			role: {
				$ref: '#/definitions/Role'
			},
			isVerified: false
		},
		BadRequestForEmailLogin: {
			'@enum': [
				'Please provide value for all the parameter',
				'Please provide a valid email',
				'Password should be of minimum 6 characters',
				'Password is not correct'
			]
		},
		BadRequestForEmailRegister: {
			'@enum': [
				'Please provide value for all the parameter',
				'Please provide a valid email',
				'Password should be of minimum 6 characters',
				'Name should be of minimum 3 characters',
				'Role will be either examinee or examiner'
			]
		}
	}
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
