import fetch from 'node-fetch';

const apiUrl = process.env.API_URL!;

describe('E2E TODO CRUD', () => {
  test('Todoに対してCRUD操作を行う', async () => {
    /**
     * Create
     */
    const createResp = await fetch(`${apiUrl}/todos`, {
      method: 'POST',
      body: JSON.stringify({
        text: 'test text',
      }),
    });
    expect(createResp.status).toBe(200);
    const createRespBody = await createResp.json();
    const todoId = createRespBody.id;
    expect(todoId).toHaveLength(36);
    expect(createRespBody.text).toBe('test text');
    expect(createRespBody.checked).toBe(false);

    /**
     * Read
     */
    const findResp = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: 'GET',
    });
    expect(findResp.status).toBe(200);
    const findRespBody = await findResp.json();
    expect(findRespBody.id).toBe(todoId);
    expect(findRespBody.text).toBe('test text');
    expect(findRespBody.checked).toBe(false);

    /**
     * Update
     */
    const updateResp = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: 'PATCH',
      body: JSON.stringify({text: 'after text'}),
    });
    expect(updateResp.status).toBe(200);
    const updateRespBody = await updateResp.json();
    expect(updateRespBody.id).toBe(todoId);
    expect(updateRespBody.text).toBe('after text');
    expect(updateRespBody.checked).toBe(false);

    /**
     * Remove
     */
    const removeResp = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: 'DELETE',
    });
    expect(removeResp.status).toBe(204);
  });
});
