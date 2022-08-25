const swaggerAutogen = require('swagger-autogen')();

const doc = {
	info: {
		version: '1.0.0',
		title: 'Quiz App',
		description: 'Documentation of quiz app endpoints'
	},
	host: 'https://a-master-quiz-app.herokuapp.com',
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
		Quiz: {
			_id: '629ca5720cf3c0efda1644b2',
			name: 'Quiz Name',
			topics: ['Python', 'Array'],
			createdBy: '629ca3d78b22bd7a8ad4e47e',
			isFree: true,
			price: 0,
			createOn: '2022-06-05T12:45:38.998Z',
			imageUrl: 'https://image-url.png'
		},
		QuestionType: {
			'@enum': ['multipleAnswer', 'multipleAnswer']
		},
		Question: {
			_id: '62b6f8dfedb16962f3d5e7f3',
			questionText: 'Question Title',
			questionType: 'singleAnswer',
			quizzes: ['62b6f86dedb16962f3d5e7ee'],
			options: ['option 1 ', 'option 2', 'option 4', 'option 3'],
			answers: ['2']
		},
		BadRequestForSigninWithEmailAndPassword: {
			'@enum': [
				'Please provide value for all the parameter',
				'Please provide a valid email',
				'Password should be of minimum 6 characters'
			]
		},
		BadRequestForCreateUserWithEmailAndPassword: {
			'@enum': [
				'Please provide value for all the parameter',
				'Please provide a valid email',
				'Password should be of minimum 6 characters',
				'Name should be of minimum 3 characters',
				'Role will be either examinee or examiner'
			]
		},
		BadRequestForSaveQuiz: {
			'@enum': [
				'Please provide quiz name',
				'Please provide a valid number for quiz duration'
			]
		}
	}
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
