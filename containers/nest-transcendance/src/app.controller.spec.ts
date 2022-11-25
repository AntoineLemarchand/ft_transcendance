import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import * as request from 'supertest';
import { AppModule } from './app.module'

describe('AuthController', () => {
	let app: INestApplication;
	let loginUser = async (username: string, password: string) => {
			return await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					username: username,
					password: password,
				});
		}

	beforeEach (async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = module.createNestApplication();
		await app.init();
	})

	it("should return 401 on wrong password", async () => {
				loginUser("Thomas", "wrong password").then((response)=>
				 expect(response.status).toBe(401))
	});

	it("should return 401 on non existing username", () => {
		loginUser("non existing user", "wrong password").then((response)=>
		 expect(response.status).toBe(401))
	});

	it("should return 201 and access token on successful login", async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'Thomas',
				password: 'test',
			})
			.expect(201)
			.then((result) => {expect(result.body.access_token).toBeDefined()});
	});

	it("should return 401 when creating an already existent user", () => {
	});
})
