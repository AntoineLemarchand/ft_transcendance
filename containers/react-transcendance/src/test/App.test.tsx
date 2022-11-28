import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../component/App';

async function getPromise() {
	return "test";
}

test('Get string from promise', () => {
	let promise = getPromise().then((result => {return result}));
	console.log(promise);
});
