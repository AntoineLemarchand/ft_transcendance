import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import * as request from 'supertest';
import { AppModule } from './app.module'
import { AppController } from './app.controller';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';

describe('AuthController', () => {
	let app: INestApplication;
	beforeEach (async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = module.createNestApplication();
		await app.init();
	})

	it("should return 401 on wrong password", () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'Thomas',
				password: 'tet',
			})
			.expect(401)
	});

	it("should return 401 on non existing username", () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'Thoas',
				password: 'test',
			})
			.expect(401)
	});

	it("should return 201 and access token on successful login", () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'Thomas',
				password: 'test',
			})
			.expect(201)
			.then((result) => {expect(result.body.access_token).toBeDefined()});
			//.expect((result) => {result.body[0]).toBe("access_token")});
			//expect(result.body.to.have("access_token");
	});
})
