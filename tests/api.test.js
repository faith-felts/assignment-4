// Integration tests for the Books API using Supertest + Jest
// These tests exercise the Express app exported from ../server
const request = require('supertest');
const app = require('../server');

// Reset the in-memory data before each test to keep tests isolated
beforeEach(() => {
	if (typeof app.resetBooks === 'function') app.resetBooks();
});

describe('Books API', () => {
	// Verify the collection endpoint returns an array of the expected length
	test('GET /api/books returns all books', async () => {
		const res = await request(app).get('/api/books');
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(3);
	});

	// Fetch a single resource and assert its shape and values
	test('GET /api/books/:id returns specific book', async () => {
		const res = await request(app).get('/api/books/1');
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('id', 1);
		expect(res.body).toHaveProperty('title', 'The Great Gatsby');
	});

	// Requesting a missing resource should return 404 and a helpful error
	test('GET /api/books/:id returns 404 for missing book', async () => {
		const res = await request(app).get('/api/books/999');
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Book not found');
	});

	// Posting a full book should create it and increase collection size
	test('POST /api/books creates a new book', async () => {
		const newBook = { title: 'New Book', author: 'Author', genre: 'Genre', copiesAvailable: 10 };
		const res = await request(app).post('/api/books').send(newBook);
		expect(res.statusCode).toBe(201);
		expect(res.body).toMatchObject(newBook);
		expect(res.body).toHaveProperty('id');

		// Verify the collection now contains the new resource
		const getRes = await request(app).get('/api/books');
		expect(getRes.body.length).toBe(4);
	});

	// Updating an existing book should return the updated object
	test('PUT /api/books/:id updates an existing book', async () => {
		const updated = { title: 'Updated Title', author: 'New Author', genre: 'Updated', copiesAvailable: 2 };
		const res = await request(app).put('/api/books/2').send(updated);
		expect(res.statusCode).toBe(200);
		expect(res.body).toMatchObject({ id: 2, ...updated });

		// Confirm the change persisted
		const getRes = await request(app).get('/api/books/2');
		expect(getRes.body.title).toBe('Updated Title');
	});

	// Updating a missing book should return 404
	test('PUT /api/books/:id returns 404 for missing book', async () => {
		const res = await request(app).put('/api/books/999').send({ title: 'x' });
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Book not found');
	});

	// Deleting a book should return success and remove it from the collection
	test('DELETE /api/books/:id removes a book', async () => {
		const res = await request(app).delete('/api/books/3');
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message', 'Book deleted successfully');

		const getRes = await request(app).get('/api/books/3');
		expect(getRes.statusCode).toBe(404);
	});

	// Deleting a non-existent book should return 404
	test('DELETE /api/books/:id returns 404 for missing book', async () => {
		const res = await request(app).delete('/api/books/999');
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Book not found');
	});

	// Edge cases: non-numeric IDs should be handled gracefully (404)
	test('GET/PUT/DELETE with non-numeric id return 404', async () => {
		const getRes = await request(app).get('/api/books/abc');
		expect(getRes.statusCode).toBe(404);

		const putRes = await request(app).put('/api/books/abc').send({ title: 'x' });
		expect(putRes.statusCode).toBe(404);

		const delRes = await request(app).delete('/api/books/abc');
		expect(delRes.statusCode).toBe(404);
	});

	// Deleting the same resource twice: first succeeds, second returns 404
	test('DELETE twice returns 200 then 404', async () => {
		const first = await request(app).delete('/api/books/3');
		expect(first.statusCode).toBe(200);

		const second = await request(app).delete('/api/books/3');
		expect(second.statusCode).toBe(404);
	});

	// POST with missing fields: server should still create a resource (edge case)
	test('POST with missing fields still creates resource (edge case)', async () => {
		const res = await request(app).post('/api/books').send({ title: 'Partial' });
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty('id');
		expect(res.body).toHaveProperty('title', 'Partial');

		// Confirm the new resource is retrievable
		const getRes = await request(app).get('/api/books/' + res.body.id);
		expect(getRes.statusCode).toBe(200);
	});

	// PUT with partial data: server currently replaces the whole object, so missing
	// fields will be undefined on the stored object — assert that behavior.
	test('PUT with partial data overwrites fields (edge case)', async () => {
		// Ensure a clean state for this assertion
		if (typeof app.resetBooks === 'function') app.resetBooks();
		const res = await request(app).put('/api/books/1').send({ title: 'Only Title' });
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('id', 1);
		expect(res.body).toHaveProperty('title', 'Only Title');
		// Other properties are removed/undefined because the server replaces the object
		expect(res.body.author).toBeUndefined();
	});

	// Edge: requests that omit the `:id` segment should not match the id-based routes
	// DELETE without an id should return 404 (no matching route)
	test('DELETE without id returns 404', async () => {
		const res = await request(app).delete('/api/books');
		expect(res.statusCode).toBe(404);
	});

	// PUT without an id should return 404 as well
	test('PUT without id returns 404', async () => {
		const res = await request(app).put('/api/books').send({ title: 'x' });
		expect(res.statusCode).toBe(404);
	});

	// POST with no body: server should return 400 (validation) when body is empty
	test('POST /api/books with no body returns 400', async () => {
		const res = await request(app).post('/api/books');
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('error', 'Request body required');
	});
});

